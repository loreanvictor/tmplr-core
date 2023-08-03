import { Execution } from '../execution'
import { Flow } from '../flow'
import { Runnable } from '../runnable'


export class SkipExecution extends Execution<void> {
  constructor(
    readonly skip: Skip,
    flow: Flow,
  ) { super(flow) }

  async run() {
    this.flow.break(this.skip.cascade)
  }
}


export class Skip extends Runnable<void> {
  constructor(
    readonly cascade: boolean,
  ) { super() }

  run(flow: Flow) { return new SkipExecution(this, flow) }
}
