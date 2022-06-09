import { IOExecution, Unpluggable } from '../io'
import { Runnable } from '../runnable'


export interface PromptIO extends Unpluggable {
  setMessage(msg: string): void
  setDefault(value: string): void
  value(): Promise<string>
}


export class PromptExecution extends IOExecution<string, PromptIO> {
  constructor(
    readonly prompt: Prompt
  ) { super() }

  async run() {
    const _default = this.prompt._default ? (await this.delegate(this.prompt._default.run())) : undefined
    const io = await this.connect()

    io.setMessage(this.prompt.msg)
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
    readonly msg: string,
    readonly _default?: Runnable<string>,
  ) { super() }

  run() {
    return new PromptExecution(this)
  }
}
