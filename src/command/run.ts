import { Execution } from '../execution'
import { Runnable } from '../runnable'
import { FileSystem } from '../filesystem'
import { Scope } from '../scope'
import { SandBox } from '../sandbox'
import { ChangeLog } from './change'
import { EvaluationContext } from '../eval'
import { createFSProvider } from '../filesystem/provider'
import { Flow } from '../flow'


export type ParseFn = (
  content: string,
  filename: string,
  scope: Scope,
  context: EvaluationContext,
  filesystem: FileSystem,
  changelog?: ChangeLog,
) => Runnable<void>


export class RunExecution extends Execution<void> {
  constructor(readonly _run: Run, flow: Flow) { super(flow) }

  async run() {
    const target = await this.delegate(this._run.target.run(this.flow))
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
          this._run.options.log,
        ),
        this._run.options.inputs || {},
        this._run.options.outputs || {},
        this._run.scope,
        new Flow(this.flow.env),
        {
          filesystem: createFSProvider(filesystem),
        },
      )
    )
  }
}


export interface RunExtras {
  inputs?: {[name: string]: Runnable<string>}
  outputs?: {[name: string]: string}
  log?: ChangeLog
}


export class Run extends Runnable<void> {
  constructor(
    readonly target: Runnable<string>,
    readonly parse: ParseFn,
    readonly filesystem: FileSystem,
    readonly scope: Scope,
    readonly context: EvaluationContext,
    readonly options: RunExtras = {},
  ) { super() }

  run(flow: Flow) {
    return new RunExecution(this, flow)
  }
}
