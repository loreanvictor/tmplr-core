import { Execution } from '../execution'
import { Runnable } from '../runnable'
import { FileSystem } from '../filesystem'


export class DegitExecution extends Execution<void> {
  constructor(readonly degit: Degit) { super() }

  async run() {
    const source = await this.delegate(this.degit.source.run())
    const target = await this.delegate(this.degit.target.run())
    await this.degit.filesystem.fetch(source, target)
  }
}


export class Degit extends Runnable<void> {
  constructor(
    readonly source: Runnable<string>,
    readonly target: Runnable<string>,
    readonly filesystem: FileSystem,
  ) { super() }

  run() { return new DegitExecution(this) }
}
