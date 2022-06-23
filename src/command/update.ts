import { Runnable } from '../runnable'
import { FileSystem } from '../filesystem'
import { EvaluationContext } from '../eval'
import { ChangeExecution, ChangeLog } from './change'


export class UpdateExecution extends ChangeExecution {
  constructor(readonly update: Update) { super(update.filesystem, update.log) }

  async commit() {
    const target = await this.delegate(this.update.target.run())
    const content = await this.update.filesystem.read(target)
    const updated = await this.update.context.evaluate(content)
    await this.update.filesystem.write(target, updated)

    return { target, content, updated }
  }
}


export class Update extends Runnable<void> {
  constructor(
    readonly target: Runnable<string>,
    readonly filesystem: FileSystem,
    readonly context: EvaluationContext,
    readonly log: ChangeLog,
  ) { super() }

  run() { return new UpdateExecution(this) }
}
