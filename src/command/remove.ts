import { Minimatch } from 'minimatch'

import { Runnable } from '../runnable'
import { FileSystem } from '../filesystem'
import { ChangeExecution, ChangeLog } from './change'


export class RemoveExecution extends ChangeExecution {
  constructor(readonly remove: Remove) { super(remove.filesystem, remove.log) }

  async commit() {
    const target = this.remove.filesystem.absolute(await this.delegate(this.remove.target.run()))
    const removals: { target: string }[] = []

    const matcher = new Minimatch(target, { dot: this.remove.hidden })

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


export class Remove extends Runnable<void> {
  constructor(
    readonly target: Runnable<string>,
    readonly hidden: boolean,
    readonly filesystem: FileSystem,
    readonly log: ChangeLog,
  ) { super() }

  run() { return new RemoveExecution(this) }
}
