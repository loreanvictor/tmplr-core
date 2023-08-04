import { Execution } from '../execution'
import { FileSystem } from '../filesystem'
import { Flow } from '../flow'
import { Runnable } from '../runnable'


export class FromFileExecution extends Execution<string> {
  constructor(
    readonly fromFile: FromFile,
    flow: Flow,
  ) { super(flow) }

  async run() {
    const target = this.fromFile.filesystem.absolute(await this.delegate(this.fromFile.target.run(this.flow)))

    try {
      return await this.fromFile.filesystem.read(target)
    } catch {
      return ''
    }
  }
}


export class FromFile extends Runnable<string> {
  constructor(
    public readonly target: Runnable<string>,
    public readonly filesystem: FileSystem,
  ) { super() }

  run(flow: Flow) { return new FromFileExecution(this, flow) }
}
