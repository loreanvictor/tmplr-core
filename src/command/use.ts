import { Scope } from '../scope'
import { EvaluationContext } from '../eval'
import { Execution } from '../execution'
import { Runnable } from '../runnable'
import { FileSystem } from '../filesystem'
import { SandBox } from '../sandbox'
import { ChangeLog } from './change'
import { ParseFn } from './run'
import { filesystemProvider } from '../filesystem/provider'
import { Flow } from '../flow'


export class UseExecution extends Execution<void> {
  constructor(readonly use: Use, flow: Flow) { super(flow) }
  async run() {
    const target = await this.delegate(this.use.target.run(this.flow))
    const dest = '.use-' + Math.random().toString(36).substr(2)

    try {
      await this.use.filesystem.fetch(target, dest)
      const recipe = await this.delegate(this.use.recipe.run(this.flow))
      const filesystem = this.use.filesystem.cd(dest)
      const content = await filesystem.read(recipe)

      await this.delegate(
        new SandBox(
          scope => this.use.parse(
            content,
            recipe,
            scope,
            new EvaluationContext(scope, this.use.context.pipes),
            filesystem,
            this.use.changelog
          ),
          this.use.inputs,
          this.use.outputs,
          this.use.scope,
          {
            filesystem: filesystemProvider(filesystem),
          }
        )
      )
    } finally {
      await this.use.filesystem.rm(dest)
    }
  }
}


export class Use extends Runnable<void> {
  constructor(
    readonly target: Runnable<string>,
    readonly recipe: Runnable<string>,
    readonly inputs: {[name: string]: Runnable<string>},
    readonly outputs: {[name: string]: string},
    readonly parse: ParseFn,
    readonly filesystem: FileSystem,
    readonly scope: Scope,
    readonly context: EvaluationContext,
    readonly changelog: ChangeLog,
  ) { super()}

  run(flow: Flow) { return new UseExecution(this, flow) }
}
