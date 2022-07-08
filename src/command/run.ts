import { dirname } from 'path'

import { Execution } from '../execution'
import { Runnable } from '../runnable'
import { FileSystem } from '../filesystem'
import { Scope } from '../scope'
import { SandBox } from '../sandbox'
import { ChangeLog } from './change'
import { EvaluationContext } from '../eval'


//TODO: add filename to parseFn parameters
export type ParseFn = (
  content: string,
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
    const filesystem = this._run.filesystem.cd(dirname(target))

    await this.delegate(
      new SandBox(
        scope => this._run.parse(
          content,
          scope,
          new EvaluationContext(scope, this._run.context.pipes),
          filesystem,
          this._run.changelog
        ),
        this._run.inputs,
        this._run.outputs,
        this._run.scope,
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
