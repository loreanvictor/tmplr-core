import { Execution } from '../execution'
import { Runnable } from '../runnable'
import { FileSystem } from '../filesystem'
import { Scope } from '../scope'
import { SandBox } from '../sandbox'
import { ChangeLog } from './change'
import { EvaluationContext } from '../eval'
import { filesystemProvider } from '../filesystem/provider'


export type ParseFn = (
  content: string,
  filename: string,
  scope: Scope,
  context: EvaluationContext,
  filesystem: FileSystem,
  changelog: ChangeLog,
) => Runnable<void>


export class RunExecution extends Execution<void> {
  constructor(readonly _run: Run) { super() }

  async run() {
    const target = await this.delegate(this._run.target.run())
    const content = await this._run.filesystem.read(target)
    const filesystem = this._run.filesystem.cd(this._run.filesystem.dirname(target))

    await this.delegate(
      new SandBox(
        scope => this._run.parse(
          content,
          target,
          scope,
          new EvaluationContext(scope, this._run.context.pipes),
          filesystem,
          this._run.changelog,
        ),
        this._run.inputs,
        this._run.outputs,
        this._run.scope,
        {
          filesystem: filesystemProvider(filesystem),
        }
      )
    )
  }
}


export class Run extends Runnable<void> {
  constructor(
    readonly target: Runnable<string>,
    readonly inputs: {[name: string]: Runnable<string>},
    readonly outputs: {[name: string]: string},
    readonly parse: ParseFn,
    readonly filesystem: FileSystem,
    readonly scope: Scope,
    readonly context: EvaluationContext,
    readonly changelog: ChangeLog,
  ) { super() }

  run() {
    return new RunExecution(this)
  }
}
