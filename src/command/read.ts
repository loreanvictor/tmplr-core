import { Store } from '../scope/store'
import { Execution } from '../execution'
import { Runnable } from '../runnable'


export class ReadExecution extends Execution<void> {
  constructor(private read: Read) { super() }

  async run() {
    const value = await this.delegate(this.read.expr.run())
    await this.read.store.set(this.read.variable, value)
  }
}


export class Read extends Runnable<void> {
  constructor(
    readonly variable: string,
    readonly expr: Runnable<string>,
    readonly store: Store,
  ) { super() }

  run() {
    return new ReadExecution(this)
  }
}
