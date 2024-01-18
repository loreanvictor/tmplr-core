import { Scope } from '../scope'
import { EvaluationContext } from '../eval'
import { Execution } from '../execution'
import { Runnable } from '../runnable'
import { FileSystem } from '../filesystem'
import { SandBox } from '../sandbox'
import { ChangeLog } from './change'
import { ParseFn } from './run'
import { createFSProvider } from '../filesystem/provider'
import { Flow } from '../flow'


export class UseExecution extends Execution<void> {
  constructor(readonly use: Use, flow: Flow) { super(flow) }
  async run() {
    const target = await this.delegate(this.use.target.run(this.flow))
    const dest = '.use-' + Math.random().toString(36).substr(2)

    const cleanup = () => this.use.filesystem.rm(dest)

    this.flow.onKill(cleanup)

    try {
      await this.use.filesystem.fetch(target, dest)
      const recipe = this.use.options.recipe ?
        await this.delegate(this.use.options.recipe.run(this.flow))
        : '.tmplr.yml'
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
            this.use.options.log
          ),
          this.use.options.inputs || {},
          this.use.options.outputs || {},
          this.use.scope,
          new Flow(this.flow.env),
          {
            filesystem: createFSProvider(filesystem),
          },
        )
      )
    } finally {
      await cleanup()
    }
  }
}


export interface UseExtras {
  inputs?: {[name: string]: Runnable<string>}
  outputs?: {[name: string]: string}
  recipe?: Runnable<string>
  log?: ChangeLog
}


export class Use extends Runnable<void> {
  constructor(
    readonly target: Runnable<string>,
    readonly parse: ParseFn,
    readonly filesystem: FileSystem,
    readonly scope: Scope,
    readonly context: EvaluationContext,
    readonly options: UseExtras = {},
  ) { super()}

  run(flow: Flow) { return new UseExecution(this, flow) }
}
