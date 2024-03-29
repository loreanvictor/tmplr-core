import { Minimatch } from 'minimatch'

import { Runnable } from '../runnable'
import { FileSystem } from '../filesystem'
import { ChangeExecution, ChangeLog } from './change'
import { Flow } from '../flow'


export class RemoveExecution extends ChangeExecution {
  constructor(readonly remove: Remove, flow: Flow) { super(flow, remove.filesystem, remove.options.log) }

  async commit() {
    const target = this.remove.filesystem.absolute(await this.delegate(this.remove.target.run(this.flow)))
    const removals: { target: string }[] = []

    const matcher = new Minimatch(target, { dot: this.remove.options.hidden })

    if (matcher.hasMagic()) {
      await Promise.all(
        (await this.remove.filesystem.ls(this.remove.filesystem.root))
          .map(path => this.remove.filesystem.absolute(path))
          .filter(path => matcher.match(path))
          .map(async path => {
            await this.remove.filesystem.rm(path)
            removals.push({ target: path })
          })
      )
    } else {
      await this.remove.filesystem.rm(target)
      removals.push({ target })
    }

    return removals
  }
}


export interface RemoveExtras {
  hidden?: boolean
  log?: ChangeLog
}


export class Remove extends Runnable<void> {
  constructor(
    readonly target: Runnable<string>,
    readonly filesystem: FileSystem,
    readonly options: RemoveExtras = {}
  ) { super() }

  run(flow: Flow) { return new RemoveExecution(this, flow) }
}
