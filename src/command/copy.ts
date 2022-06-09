import { Execution } from '../execution'
import { Runnable } from '../runnable'
import { FileSystem } from '../filesystem'
import { EvaluationContext } from '../eval'


export class CopyExecution extends Execution<void> {
  constructor(readonly copy: Copy) { super() }

  async run() {
    const source = await this.delegate(this.copy.source.run())
    const dest = await this.delegate(this.copy.dest.run())
    const content = await this.copy.filesystem.read(source)
    const updated = await this.copy.context.evaluate(content)
    await this.copy.filesystem.write(dest, updated)
  }
}


export class Copy extends Runnable<void> {
  constructor(
    readonly source: Runnable<string>,
    readonly dest: Runnable<string>,
    readonly filesystem: FileSystem,
    readonly context: EvaluationContext,
  ) { super() }

  run() { return new CopyExecution(this) }
}
