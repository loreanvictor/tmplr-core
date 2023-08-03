import { Runnable } from '../runnable'
import { FileSystem } from '../filesystem'
import { ChangeExecution, ChangeLog } from './change'
import { Flow } from '../flow'


export class DegitExecution extends ChangeExecution {
  constructor(readonly degit: Degit, flow: Flow) { super(flow, degit.filesystem, degit.options.log) }

  async commit() {
    const source = await this.delegate(this.degit.source.run(this.flow))
    const target = await this.delegate(this.degit.target.run(this.flow))
    await this.degit.filesystem.fetch(source, target)

    return { source, target }
  }
}


export interface DegitExtras {
  log?: ChangeLog
}


export class Degit extends Runnable<void> {
  constructor(
    readonly source: Runnable<string>,
    readonly target: Runnable<string>,
    readonly filesystem: FileSystem,
    readonly options: DegitExtras = {},
  ) { super() }

  run(flow: Flow) { return new DegitExecution(this, flow) }
}
