import { Runnable } from '../runnable'
import { Execution } from '../execution'
import { Flow } from '../flow'


export class IfExecution extends Execution<void> {
  constructor(readonly if_: If, flow: Flow) { super(flow) }

  async run() {
    const condition = await this.delegate(this.if_.condition.run(this.flow))

    if (condition && condition.length > 0) {
      await this.delegate(this.if_.then.run(this.flow))
    } else if (this.if_._else) {
      await this.delegate(this.if_._else.run(this.flow))
    }
  }
}


export class If extends Runnable<void> {
  constructor(
    readonly condition: Runnable<string>,
    readonly then: Runnable<void>,
    readonly _else?: Runnable<void>,
  ) { super() }

  run(flow: Flow) { return new IfExecution(this, flow) }
}
