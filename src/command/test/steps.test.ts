import { Runnable } from '../../runnable'
import { Execution } from '../../execution'
import { Steps } from '../steps'
import { Flow } from '../../flow'


class DummyExec extends Execution<void> {
  constructor(
    readonly runnable: Runnable<void>,
    flow: Flow,
  ) { super(flow) }

  async run() { }
}

class DummyStep extends Runnable<void> {
  run(flow: Flow) {
    return new DummyExec(this, flow)
  }
}


describe(Steps, () => {
  it('should run all steps', async () => {
    const steps = [new DummyStep(), new DummyStep(), new DummyStep()]
    const exec = new Steps(steps).run(new Flow({ onKill: jest.fn() }))

    const trace = exec.trace()
    await trace.result

    expect(trace.stacks.length).toBe(7)
    expect(trace.stacks[0]!.peek()).toBe(exec)
    expect(trace.stacks[1]!.peek()).toBeInstanceOf(DummyExec)
    expect((trace.stacks[1]!.peek() as DummyExec).runnable).toBe(steps[0])
    expect(trace.stacks[2]!.peek()).toBe(exec)
    expect((trace.stacks[3]!.peek() as DummyExec).runnable).toBe(steps[1])
    expect(trace.stacks[4]!.peek()).toBe(exec)
    expect((trace.stacks[5]!.peek() as DummyExec).runnable).toBe(steps[2])
    expect(trace.stacks[6]!.peek()).toBe(exec)
  })
})
