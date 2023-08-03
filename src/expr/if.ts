import { Runnable } from '../runnable'
import { Execution } from '../execution'
import { Flow } from '../flow'


export class IfExecution extends Execution<string> {
  constructor(readonly if_: If, flow: Flow) { super(flow) }

  async run() {
    const condition = await this.delegate(this.if_.condition.run(this.flow))

    if (condition && condition.length > 0) {
      return (await this.delegate<string | void>(this.if_.then.run(this.flow))) || ''
    } else if (this.if_._else) {
      return (await this.delegate<string | void>(this.if_._else.run(this.flow))) || ''
    } else {
      return ''
    }
  }
}


export class If extends Runnable<string> {
  constructor(
    readonly condition: Runnable<string>,
    readonly then: Runnable<string> | Runnable<void>,
    readonly _else?: Runnable<string> | Runnable<void>,
  ) { super() }

  run(flow: Flow) { return new IfExecution(this, flow) }
}
