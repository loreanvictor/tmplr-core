import { Runnable } from '../runnable'
import { Execution } from '../execution'


export class StepsExecution extends Execution<void> {
  constructor(
    readonly steps: Steps
  ) { super() }

  async run() {
    for (const step of this.steps.steps) {
      await this.delegate(step.run())
    }
  }
}


export class Steps extends Runnable<void> {
  constructor(
    readonly steps: Runnable<void>[]
  ) { super() }

  run() {
    return new StepsExecution(this)
  }
}
