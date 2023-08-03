import { Minimatch, sep } from 'minimatch'

import { Runnable } from '../runnable'
import { FileSystem } from '../filesystem'
import { EvaluationContext } from '../eval'
import { ChangeExecution, ChangeLog } from './change'
import { Flow } from '../flow'


export class CopyExecution extends ChangeExecution {
  constructor(readonly copy: Copy, flow: Flow) { super(flow, copy.filesystem, copy.options.log) }

  async commit() {
    const source = this.copy.filesystem.absolute(await this.delegate(this.copy.source.run(this.flow)))
    const dest = this.copy.filesystem.absolute(await this.delegate(this.copy.dest.run(this.flow)))

    const copies: {source: string, dest: string, content: string, updated: string}[] = []
    const matcher = new Minimatch(source, { dot: this.copy.options.hidden })
    const split = source.split(sep)
    const index = split.findIndex(part => new Minimatch(part).hasMagic())
    const prefix = split.slice(0, index > 0 ? index : split.length).join(sep)

    await Promise.all(
      (await this.copy.filesystem.ls(this.copy.filesystem.root))
        .map(path => this.copy.filesystem.absolute(path))
        .filter(path => matcher.match(path))
        .map(async src => {
          const content = await this.copy.filesystem.read(src)
          const updated = await this.copy.context.evaluate(content)

          const dst = dest + src.replace(prefix, '')
          await this.copy.filesystem.write(dst, updated)

          copies.push({ source: src, dest: dst, content, updated })
        })
    )

    return copies
  }
}


export interface CopyExtras {
  hidden?: boolean
  log?: ChangeLog
}


export class Copy extends Runnable<void> {
  constructor(
    readonly source: Runnable<string>,
    readonly dest: Runnable<string>,
    readonly filesystem: FileSystem,
    readonly context: EvaluationContext,
    readonly options: CopyExtras = {}
  ) { super() }

  run(flow: Flow) { return new CopyExecution(this, flow) }
}
