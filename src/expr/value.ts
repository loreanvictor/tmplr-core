import { Execution } from '../execution'
import { Flow } from '../flow'
import { Runnable } from '../runnable'


export class ValueExecution extends Execution<string> {
  constructor(
    readonly value: Value,
    flow: Flow
  ) { super(flow) }

  async run() {
    return this.value.value
  }
}


export class Value extends Runnable<string> {
  constructor(
    readonly value: string
  ) { super() }

  run(flow: Flow) {
    return new ValueExecution(this, flow)
  }
}
