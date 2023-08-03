import { Store } from '../scope/store'
import { Execution } from '../execution'
import { Runnable } from '../runnable'
import { Flow } from '../flow'


export class ReadExecution extends Execution<void> {
  constructor(private read: Read, flow: Flow) { super(flow) }

  async run() {
    const value = await this.delegate(this.read.expr.run(this.flow))
    await this.read.store.set(this.read.variable, value)
  }
}


export class Read extends Runnable<void> {
  constructor(
    readonly variable: string,
    readonly expr: Runnable<string>,
    readonly store: Store,
  ) { super() }

  run(flow: Flow) {
    return new ReadExecution(this, flow)
  }
}
