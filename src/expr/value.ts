import { Execution } from '../execution'
import { Runnable } from '../runnable'


export class ValueExecution extends Execution<string> {
  constructor(
    readonly value: Value
  ) { super() }

  async run() {
    return this.value.value
  }
}


export class Value extends Runnable<string> {
  constructor(
    readonly value: string
  ) { super() }

  run() {
    return new ValueExecution(this)
  }
}
