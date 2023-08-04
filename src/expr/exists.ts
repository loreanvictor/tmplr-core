import { Minimatch } from 'minimatch'
import { Execution } from '../execution'
import { FileSystem } from '../filesystem'
import { Flow } from '../flow'
import { Runnable } from '../runnable'


export class ExistsExecution extends Execution<string> {
  constructor(
    readonly exists: Exists,
    flow: Flow,
  ) { super(flow) }

  async run() {
    const target = this.exists.filesystem.absolute(await this.delegate(this.exists.target.run(this.flow)))
    const matcher = new Minimatch(target, { dot: this.exists.options.hidden })
    const candidate = (await this.exists.filesystem.ls(this.exists.filesystem.root))
      .map(path => this.exists.filesystem.absolute(path))
      .find(path => matcher.match(path))

    return candidate || ''
  }
}


export interface ExistsExtras {
  hidden?: boolean
}

export class Exists extends Runnable<string> {
  constructor(
    public readonly target: Runnable<string>,
    public readonly filesystem: FileSystem,
    public readonly options: ExistsExtras = {}
  ) { super() }

  run(flow: Flow) { return new ExistsExecution(this, flow) }
}
