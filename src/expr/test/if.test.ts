import { Execution } from '../../execution'
import { Runnable } from '../../runnable'
import { Value } from '../value'
import { If } from '../if'
import { Flow } from '../../flow'


class DummyExec extends Execution<void> {
  constructor(readonly runnable: DummyRunnable, flow: Flow) { super(flow) }
  async run() { this.runnable.fn() }
}

class DummyRunnable extends Runnable<void> {
  constructor(readonly fn: () => void) { super() }
  run(flow: Flow) { return new DummyExec(this, flow) }
}


describe(If, () => {
  test('runs given runnable when given condition evaluates to a non empty string.', async () => {
    const _then = new DummyRunnable(jest.fn())
    const _if = new If(new Value('whatever'), _then)

    await _if.run(new Flow()).execute()
    expect(_then.fn).toHaveBeenCalled()
  })

  test('does not run when the given condition evaluates to an empty string.', async () => {
    const _then = new DummyRunnable(jest.fn())
    const _if = new If(new Value(''), _then)

    await _if.run(new Flow()).execute()
    expect(_then.fn).not.toHaveBeenCalled()
  })

  test('runs the else runnable if the given condition evaluates to an empty string.', async () => {
    const _then = new DummyRunnable(jest.fn())
    const _else = new DummyRunnable(jest.fn())
    const _if = new If(new Value(''), _then, _else)

    await _if.run(new Flow()).execute()
    expect(_then.fn).not.toHaveBeenCalled()
    expect(_else.fn).toHaveBeenCalled()
  })

  test('is like a ternary operator.', async () => {
    const val1 = await new If(
      new Value('not_empty'),
      new Value('then')
    ).run(new Flow()).execute()
    expect(val1).toBe('then')

    const val2 = await new If(
      new Value(''),
      new Value('then'),
      new Value('else')
    ).run(new Flow()).execute()
    expect(val2).toBe('else')

    const val3 = await new If(
      new Value(''),
      new Value('then')
    ).run(new Flow()).execute()
    expect(val3).toBe('')

    const val4 = await new If(
      new Value('not_empty'),
      new DummyRunnable(() => {}),
      new Value('else')
    ).run(new Flow()).execute()
    expect(val4).toBe('')
  })
})
