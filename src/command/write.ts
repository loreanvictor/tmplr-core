import { EvaluationContext } from '../eval'
import { FileSystem } from '../filesystem'
import { Flow } from '../flow'
import { Runnable } from '../runnable'
import { ChangeExecution, ChangeLog } from './change'


export class WriteExecution extends ChangeExecution {
  constructor(readonly write: Write, flow: Flow) { super(flow, write.filesystem, write.options.log) }

  async commit() {
    const target = this.write.filesystem.absolute(await this.delegate(this.write.target.run(this.flow)))
    const raw = await this.delegate(this.write.content.run(this.flow))
    const content = await this.write.context.evaluate(raw)

    await this.write.filesystem.write(target, content)

    return { target, content, raw }
  }
}


export interface WriteExtras {
  log?: ChangeLog
}


export class Write extends Runnable<void> {
  constructor(
    readonly content: Runnable<string>,
    readonly target: Runnable<string>,
    readonly filesystem: FileSystem,
    readonly context: EvaluationContext,
    readonly options: WriteExtras = {}
  ) { super() }

  run(flow: Flow) { return new WriteExecution(this, flow) }
}
