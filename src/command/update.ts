import { minimatch } from 'minimatch'

import { Runnable } from '../runnable'
import { FileSystem } from '../filesystem'
import { EvaluationContext } from '../eval'
import { ChangeExecution, ChangeLog } from './change'
import { Flow } from '../flow'


export class UpdateExecution extends ChangeExecution {
  constructor(readonly update: Update, flow: Flow) { super(flow, update.filesystem, update.options.log) }

  async commit() {
    const target = this.filesystem.absolute(await this.delegate(this.update.target.run(this.flow)))
    const updates: {target: string, content: string, updated: string}[] = []

    await Promise.all(
      (await this.update.filesystem.ls(this.update.filesystem.root))
        .map(path => this.update.filesystem.absolute(path))
        .filter(path => minimatch(path, target, { dot: this.update.options.hidden }))
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


export interface UpdateExtras {
  hidden?: boolean
  log?: ChangeLog
}


export class Update extends Runnable<void> {
  constructor(
    readonly target: Runnable<string>,
    readonly filesystem: FileSystem,
    readonly context: EvaluationContext,
    readonly options: UpdateExtras = {},
  ) { super() }

  run(flow: Flow) { return new UpdateExecution(this, flow) }
}
