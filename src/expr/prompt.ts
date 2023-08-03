import { Flow } from '../flow'
import { IOExecution, Unpluggable } from '../io'
import { Runnable } from '../runnable'


export interface PromptIO extends Unpluggable {
  setMessage(msg: string): void
  setDefault(value: string): void
  value(): Promise<string>
}


export class PromptExecution extends IOExecution<string, PromptIO> {
  constructor(
    readonly prompt: Prompt,
    flow: Flow,
  ) { super(flow) }

  async run() {
    const msg = await this.delegate(this.prompt.msg.run(this.flow))
    const _default = this.prompt._default ? (await this.delegate(this.prompt._default.run(this.flow))) : undefined
    const io = await this.connect()

    io.setMessage(msg)
    if (_default) {
      io.setDefault(_default)
    }

    const res = await io.value()
    io.unplug()

    return res
  }
}


export class Prompt extends Runnable<string> {
  constructor(
    readonly msg: Runnable<string>,
    readonly _default?: Runnable<string>,
  ) { super() }

  run(flow: Flow) {
    return new PromptExecution(this, flow)
  }
}
