import { Runnable } from '../runnable'
import { FileSystem } from '../filesystem'
import { ChangeExecution, ChangeLog } from './change'


export class RemoveExecution extends ChangeExecution {
  constructor(readonly remove: Remove) { super(remove.filesystem, remove.log) }

  async commit() {
    const target = await this.delegate(this.remove.target.run())
    await this.remove.filesystem.rm(target)

    return { target }
  }
}


export class Remove extends Runnable<void> {
  constructor(
    readonly target: Runnable<string>,
    readonly filesystem: FileSystem,
    readonly log: ChangeLog,
  ) { super() }

  run() { return new RemoveExecution(this) }
}
