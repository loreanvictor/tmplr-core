import { Execution } from '../../execution'
import { Flow } from '../../flow'
import { Runnable } from '../../runnable'
import { Skip } from '../skip'
import { Steps } from '../steps'


class DummyExec extends Execution<void> {
  constructor(
    readonly step: DummyStep,
    flow: Flow,
  ) { super(flow) }

  async run() {
    this.step.fn()
  }
}

class DummyStep extends Runnable<void> {
  constructor(
    readonly fn: () => void,
  ) { super() }

  run(flow: Flow) { return new DummyExec(this, flow) }
}


describe(Skip, () => {
  test('skips execution.', async () => {
    const seen: string[] = []

    await new Steps([
      new DummyStep(() => seen.push('first')),
      new DummyStep(() => seen.push('second')),
      new Skip(),
      new DummyStep(() => seen.push('third')),
    ]).run(new Flow()).execute()

    expect(seen).toEqual(['first', 'second' ])
  })

  test('skips execution without cascade.', async () => {
    const seen: string[] = []

    await new Steps([
      new DummyStep(() => seen.push('first')),
      new DummyStep(() => seen.push('second')),
      new Steps([
        new DummyStep(() => seen.push('third')),
        new Skip(),
        new DummyStep(() => seen.push('fourth')),
      ]),
      new DummyStep(() => seen.push('fifth')),
    ]).run(new Flow()).execute()

    expect(seen).toEqual(['first', 'second', 'third', 'fifth'])
  })

  test('skips execution with cascade.', async () => {
    const seen: string[] = []

    await new Steps([
      new DummyStep(() => seen.push('first')),
      new DummyStep(() => seen.push('second')),
      new Steps([
        new DummyStep(() => seen.push('third')),
        new Skip({ cascade: true }),
        new DummyStep(() => seen.push('fourth')),
      ]),
      new DummyStep(() => seen.push('fifth')),
    ]).run(new Flow()).execute()

    expect(seen).toEqual(['first', 'second', 'third'])
  })
})
