import { Flow } from '../flow'
import { IOExecution, Unpluggable } from '../io'
import { Runnable } from '../runnable'


export interface ChoicesIO extends Unpluggable {
  setMessage(message: string)
  setChoices(choices: string[])
  pick(): Promise<number>
}


export interface Choice {
  label: Runnable<string>
  value: Runnable<string>
}


export class ChoicesExecution extends IOExecution<string, ChoicesIO> {
  constructor(readonly choices: Choices, flow: Flow) { super(flow) }

  async run() {
    const message = await this.delegate(this.choices.msg.run(this.flow))
    const choices: string[] = []

    for (const choice of this.choices.choices) {
      choices.push(await this.delegate(choice.label.run(this.flow)))
    }

    const io = await this.connect()

    io.setMessage(message)
    io.setChoices(choices)

    const selected = await io.pick()
    io.unplug()

    return this.delegate(this.choices.choices[selected]!.value.run(this.flow))
  }
}


export class Choices extends Runnable<string> {
  constructor(
    readonly msg: Runnable<string>,
    readonly choices: Choice[]
  ) { super() }

  run(flow: Flow) { return new ChoicesExecution(this, flow) }
}
