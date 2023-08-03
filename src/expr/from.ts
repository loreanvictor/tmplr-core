import { Execution } from '../execution'
import { Flow } from '../flow'
import { Runnable } from '../runnable'
import { Source } from '../scope'


export class FromExecution extends Execution<string> {
  constructor(readonly from: From, flow: Flow) { super(flow) }

  async run() {
    if (await this.from.source.has(this.from.name)) {
      return await this.from.source.get(this.from.name)
    } if (this.from.options.fallback) {
      return await this.delegate(this.from.options.fallback.run(this.flow))
    } else {
      return ''
    }
  }
}


export interface FromExtras {
  fallback?: Runnable<string>
}


export class From extends Runnable<string> {
  constructor(
    readonly name: string,
    readonly source: Source,
    readonly options: FromExtras = {},
  ) { super() }

  run(flow: Flow) { return new FromExecution(this, flow) }
}
