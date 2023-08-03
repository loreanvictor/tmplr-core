import { Runnable } from '../runnable'
import { Execution } from '../execution'
import { Flow } from '../flow'


export class StepsExecution extends Execution<void> {
  constructor(
    readonly steps: Steps,
    flow: Flow,
  ) { super(flow) }

  async run() {
    const flow = this.flow.fork()

    for (const step of this.steps.steps) {
      await this.delegate(step.run(flow))

      if (flow.broken) {
        break
      }
    }
  }
}


export class Steps extends Runnable<void> {
  constructor(
    readonly steps: Runnable<void>[]
  ) { super() }

  run(flow: Flow) {
    return new StepsExecution(this, flow)
  }
}
