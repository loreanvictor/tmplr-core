import { Runnable } from '../runnable'
import { Execution } from '../execution'
import { EvaluationContext } from '../eval/context'
import { Flow } from '../flow'


export class EvalExecution extends Execution<string> {
  constructor(
    readonly _eval: Eval,
    flow: Flow,
  ) { super(flow) }


  async run() {
    if (this._eval.options.steps) {
      await this.delegate(this._eval.options.steps.run(this.flow))
    }

    return await this._eval.context.evaluate(this._eval.expr)
  }
}


export interface EvalExtras {
  steps?: Runnable<void>
}

export class Eval extends Runnable<string> {
  constructor(
    readonly expr: string,
    readonly context: EvaluationContext,
    readonly options: EvalExtras = {},
  ) { super() }

  run(flow: Flow) {
    return new EvalExecution(this, flow)
  }
}
