import { Execution } from '../../execution'
import { Runnable } from '../../runnable'
import { Value } from '../../expr/value'
import { If } from '../if'


class DummyExec extends Execution<void> {
  constructor(readonly runnable: DummyRunnable) { super() }
  async run() { this.runnable.fn() }
}

class DummyRunnable extends Runnable<void> {
  constructor(readonly fn: () => void) { super() }
  run() { return new DummyExec(this) }
}


describe(If, () => {
  test('runs given runnable when given condition evaluates to a non empty string.', async () => {
    const _then = new DummyRunnable(jest.fn())
    const _if = new If(new Value('whatever'), _then)

    await _if.run().execute()
    expect(_then.fn).toHaveBeenCalled()
  })

  test('does not run when the given condition evaluates to an empty string.', async () => {
    const _then = new DummyRunnable(jest.fn())
    const _if = new If(new Value(''), _then)

    await _if.run().execute()
    expect(_then.fn).not.toHaveBeenCalled()
  })

  test('runs the else runnable if the given condition evaluates to an empty string.', async () => {
    const _then = new DummyRunnable(jest.fn())
    const _else = new DummyRunnable(jest.fn())
    const _if = new If(new Value(''), _then, _else)

    await _if.run().execute()
    expect(_then.fn).not.toHaveBeenCalled()
    expect(_else.fn).toHaveBeenCalled()
  })
})
