import { minimatch } from 'minimatch'

import { Runnable } from '../runnable'
import { FileSystem } from '../filesystem'
import { EvaluationContext } from '../eval'
import { ChangeExecution, ChangeLog } from './change'


export class UpdateExecution extends ChangeExecution {
  constructor(readonly update: Update) { super(update.filesystem, update.log) }

  async commit() {
    const target = this.filesystem.absolute(await this.delegate(this.update.target.run()))
    const updates: {target: string, content: string, updated: string}[] = []

    console.log(target)

    await Promise.all(
      (await this.update.filesystem.ls(this.update.filesystem.root))
        .filter(path => minimatch(path, target))
        .map(async path => {
          const content = await this.update.filesystem.read(path)
          const updated = await this.update.context.evaluate(content)
          await this.update.filesystem.write(path, updated)

          updates.push({ target: path, content, updated })
        })
    )

    return updates
  }
}


export class Update extends Runnable<void> {
  constructor(
    readonly target: Runnable<string>,
    readonly filesystem: FileSystem,
    readonly context: EvaluationContext,
    readonly log: ChangeLog,
  ) { super() }

  run() { return new UpdateExecution(this) }
}
