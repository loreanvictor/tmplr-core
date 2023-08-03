import { Execution } from '../execution'
import { Flow } from '../flow'
import { Runnable } from '../runnable'


export class SkipExecution extends Execution<void> {
  constructor(
    readonly skip: Skip,
    flow: Flow,
  ) { super(flow) }

  async run() {
    this.flow.break(this.skip.options.cascade)
  }
}


export interface SkipExtras {
  cascade?: boolean
}


export class Skip extends Runnable<void> {
  constructor(
    readonly options: SkipExtras = {},
  ) { super() }

  run(flow: Flow) { return new SkipExecution(this, flow) }
}
