import { IOExecution, Unpluggable } from '../io'
import { Runnable } from '../runnable'
import { Deferred } from '../deferred'


export interface PromptIO extends Unpluggable {
  setMessage(msg: string): void
  setDefault(value: string): void
  onValue(cb: (value: string) => void)
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

    const res = new Deferred<string>()
    io.onValue(value => {
      io.unplug()
      res.resolve(value)
    })

    return res.promise
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
