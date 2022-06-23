import { Runnable } from '../runnable'
import { FileSystem } from '../filesystem'
import { ChangeExecution, ChangeLog } from './change'


export class DegitExecution extends ChangeExecution {
  constructor(readonly degit: Degit) { super(degit.filesystem, degit.log) }

  async commit() {
    const source = await this.delegate(this.degit.source.run())
    const target = await this.delegate(this.degit.target.run())
    await this.degit.filesystem.fetch(source, target)

    return { source, target }
  }
}


export class Degit extends Runnable<void> {
  constructor(
    readonly source: Runnable<string>,
    readonly target: Runnable<string>,
    readonly filesystem: FileSystem,
    readonly log: ChangeLog,
  ) { super() }

  run() { return new DegitExecution(this) }
}
