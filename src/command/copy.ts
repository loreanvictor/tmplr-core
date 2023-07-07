import { Minimatch, sep } from 'minimatch'

import { Runnable } from '../runnable'
import { FileSystem } from '../filesystem'
import { EvaluationContext } from '../eval'
import { ChangeExecution, ChangeLog } from './change'


export class CopyExecution extends ChangeExecution {
  constructor(readonly copy: Copy) { super(copy.filesystem,copy.log) }

  async commit() {
    const source = this.copy.filesystem.absolute(await this.delegate(this.copy.source.run()))
    const dest = this.copy.filesystem.absolute(await this.delegate(this.copy.dest.run()))

    const copies: {source: string, dest: string, content: string, updated: string}[] = []
    const matcher = new Minimatch(source)
    const split = source.split(sep)
    const index = split.findIndex(part => new Minimatch(part).hasMagic())
    const prefix = split.slice(0, index > 0 ? index : split.length).join(sep)

    await Promise.all(
      (await this.copy.filesystem.ls(this.copy.filesystem.root))
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


export class Copy extends Runnable<void> {
  constructor(
    readonly source: Runnable<string>,
    readonly dest: Runnable<string>,
    readonly filesystem: FileSystem,
    readonly context: EvaluationContext,
    readonly log: ChangeLog,
  ) { super() }

  run() { return new CopyExecution(this) }
}
