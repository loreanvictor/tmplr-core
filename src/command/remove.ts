import { minimatch } from 'minimatch'

import { Runnable } from '../runnable'
import { FileSystem } from '../filesystem'
import { ChangeExecution, ChangeLog } from './change'


export class RemoveExecution extends ChangeExecution {
  constructor(readonly remove: Remove) { super(remove.filesystem, remove.log) }

  async commit() {
    const target = await this.delegate(this.remove.target.run())
    const removals: { target: string }[] = []

    await Promise.all(
      (await this.remove.filesystem.ls(this.remove.filesystem.root))
        .filter(path => minimatch(path, target))
        .map(async path => {
          await this.remove.filesystem.rm(path)
          removals.push({ target: path })
        })
    )

    return removals
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
