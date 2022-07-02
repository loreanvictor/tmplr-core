import { Runnable } from '../runnable'
import { Execution } from '../execution'
import { EvaluationContext } from '../eval/context'


export class EvalExecution extends Execution<string> {
  constructor(
    readonly _eval: Eval
  ) { super() }


  async run() {
    if (this._eval.steps) {
      await this.delegate(this._eval.steps.run())
    }

    return await this._eval.context.evaluate(this._eval.expr)
  }
}


export class Eval extends Runnable<string> {
  constructor(
    readonly expr: string,
    readonly context: EvaluationContext,
    readonly steps?: Runnable<void>,
  ) { super() }

  run() {
    return new EvalExecution(this)
  }
}
