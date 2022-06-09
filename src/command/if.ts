import { Runnable } from '../runnable'
import { Execution } from '../execution'


export class IfExecution extends Execution<void> {
  constructor(readonly if_: If) { super() }

  async run() {
    const condition = await this.delegate(this.if_.condition.run())

    if (condition && condition.length > 0) {
      await this.delegate(this.if_.then.run())
    } else if (this.if_._else) {
      await this.delegate(this.if_._else.run())
    }
  }
}


export class If extends Runnable<void> {
  constructor(
    readonly condition: Runnable<string>,
    readonly then: Runnable<void>,
    readonly _else?: Runnable<void>,
  ) { super() }

  run() { return new IfExecution(this) }
}
