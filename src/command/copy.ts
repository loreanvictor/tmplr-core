import { Runnable } from '../runnable'
import { FileSystem } from '../filesystem'
import { EvaluationContext } from '../eval'
import { ChangeExecution, ChangeLog } from './change'


export class CopyExecution extends ChangeExecution {
  constructor(readonly copy: Copy) { super(copy.filesystem,copy.log) }

  async commit() {
    const source = await this.delegate(this.copy.source.run())
    const dest = await this.delegate(this.copy.dest.run())
    const content = await this.copy.filesystem.read(source)
    const updated = await this.copy.context.evaluate(content)
    await this.copy.filesystem.write(dest, updated)

    return { source, dest, content, updated }
  }
}


export class Copy extends Runnable<void> {
  constructor(
    readonly source: Runnable<string>,
    readonly dest: Runnable<string>,
    readonly filesystem: FileSystem,
    readonly context: EvaluationContext,
    readonly log: ChangeLog,
  ) { super() }

  run() { return new CopyExecution(this) }
}
