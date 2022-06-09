import { Execution } from '../execution'
import { Runnable } from '../runnable'
import { FileSystem } from '../filesystem'
import { EvaluationContext } from '../eval'


export class UpdateExecution extends Execution<void> {
  constructor(readonly update: Update) { super() }

  async run() {
    const target = await this.delegate(this.update.target.run())
    const content = await this.update.filesystem.read(target)
    const updated = await this.update.context.evaluate(content)
    await this.update.filesystem.write(target, updated)
  }
}


export class Update extends Runnable<void> {
  constructor(
    readonly target: Runnable<string>,
    readonly filesystem: FileSystem,
    readonly context: EvaluationContext,
  ) { super() }

  run() { return new UpdateExecution(this) }
}
