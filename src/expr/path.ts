import { Execution } from '../execution'
import { Runnable } from '../runnable'
import { FileSystem } from '../filesystem'


export class PathExecution extends Execution<string> {
  constructor(readonly path: Path) { super() }

  async run() {
    const path = await this.delegate(this.path.expr.run())

    return this.path.filesystem.absolute(path)
  }
}


export class Path extends Runnable<string> {
  constructor(
    readonly expr: Runnable<string>,
    readonly filesystem: FileSystem,
  ) { super() }

  run() { return new PathExecution(this) }
}
