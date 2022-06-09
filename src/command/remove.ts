import { Execution } from '../execution'
import { Runnable } from '../runnable'
import { FileSystem } from '../filesystem'


export class RemoveExecution extends Execution<void> {
  constructor(readonly remove: Remove) { super() }

  async run() {
    const target = await this.delegate(this.remove.target.run())
    await this.remove.filesystem.rm(target)
  }
}


export class Remove extends Runnable<void> {
  constructor(
    readonly target: Runnable<string>,
    readonly filesystem: FileSystem,
  ) { super() }

  run() { return new RemoveExecution(this) }
}
