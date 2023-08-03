import { Execution } from '../execution'
import { Runnable } from '../runnable'
import { FileSystem } from '../filesystem'
import { Flow } from '../flow'


export class PathExecution extends Execution<string> {
  constructor(readonly path: Path, flow: Flow) { super(flow) }

  async run() {
    const path = await this.delegate(this.path.expr.run(this.flow))

    return this.path.filesystem.absolute(path)
  }
}


export class Path extends Runnable<string> {
  constructor(
    readonly expr: Runnable<string>,
    readonly filesystem: FileSystem,
  ) { super() }

  run(flow: Flow) { return new PathExecution(this, flow) }
}
