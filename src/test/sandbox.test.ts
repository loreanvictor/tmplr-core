import { Read } from '../command/read'
import { Eval } from '../expr/eval'
import { Steps, StepsExecution } from '../command/steps'
import { Runnable } from '../runnable'
import { Execution } from '../execution'
import { SandBox } from '../sandbox'
import { CleanableProvider, providerFromFunctions, Scope, scopeFromProviders } from '../scope'
import { EvaluationContext } from '../eval/context'
import { Flow } from '../flow'
import { Prompt, Value } from '../expr'
import sleep from 'sleep-promise'


class ExA extends Execution<void> {
  constructor(readonly R: RA, flow: Flow) { super(flow) }
  async run() { await this.R.scope.get('args.a') }
}

class RA extends Runnable<void> {
  constructor(readonly scope: Scope) { super() }
  run(flow: Flow) { return new ExA(this, flow) }
}

class ExB extends Execution<void> {
  constructor(readonly R: RB, flow: Flow) { super(flow) }
  async run() { await this.R.scope.get('args.b') }
}

class RB extends Runnable<void> {
  constructor(readonly scope: Scope) { super() }
  run(flow: Flow) { return new ExB(this, flow) }
}

class ExC extends Execution<void> {
  constructor(readonly R: RC, flow: Flow) { super(flow) }
  async run() { await this.delegate(this.R.rb.run(this.flow)) }
}

class RC extends Runnable<void> {
  constructor(readonly rb: RB) { super() }
  run(flow: Flow) { return new ExC(this, flow) }
}

class ExArg1 extends Execution<string> { async run() { return 'a' } }
class RArg1 extends Runnable<string> { run(flow: Flow) { return new ExArg1(flow) }}
class ExArg2 extends Execution<string> { async run() { return 'b' } }
class RArg2 extends Runnable<string> { run(flow: Flow) { return new ExArg2(flow) }}


describe(SandBox, () => {
  test('properly executes given runnable.', async () => {
    const scope = scopeFromProviders({}, '_', { foo: 'bar' })
    let received: Scope = {} as any
    await scope.set('baz', 'qux')

    const sandbox = new SandBox(
      s => {
        received = s

        return new Steps([
          new Read('AA', new Eval('{{ args.a }}', new EvaluationContext(s)), s),
          new Read('output',
            new Eval('{{ AA }} --- {{ args.b }}', new EvaluationContext(s)),
            s
          ),
        ])
      },
      {
        a: new RArg1(),
        b: new RArg2(),
      },
      { C: 'output' },
      scope,
      new Flow({ onKill: () => () => {} }),
    )

    await sandbox.execute()

    await expect(scope.has('C')).resolves.toBe(true)
    await expect(scope.get('C')).resolves.toBe('a --- b')

    await expect(scope.has('args')).resolves.toBe(false)
    await expect(scope.has('output')).resolves.toBe(false)
    await expect(scope.has('AA')).resolves.toBe(false)

    await expect(received.has('foo')).resolves.toBe(true)
    await expect(received.has('baz')).resolves.toBe(false)
  })

  test('cleans up the scope after execution.', async () => {
    const isolatedCleanup = jest.fn()
    const cleanable: CleanableProvider = {
      ...providerFromFunctions({ foo: async () => 'bar' }),
      cleanup: jest.fn(),
      isolate: () => ({ ...cleanable, cleanup: isolatedCleanup }),
    }

    const scope = scopeFromProviders({ cleanable }, '_')
    await new SandBox(() => new Steps([]), {}, {}, scope, new Flow({ onKill: () => () => {}})).execute()

    expect(cleanable.cleanup).not.toHaveBeenCalled()
    expect(isolatedCleanup).toHaveBeenCalled()
  })

  test('cleans up the scope on kill.', async () => {
    const isolatedCleanup = jest.fn()
    const cleanable: CleanableProvider = {
      ...providerFromFunctions({ foo: async () => 'bar' }),
      cleanup: jest.fn(),
      isolate: () => ({ ...cleanable, cleanup: isolatedCleanup }),
    }

    const scope = scopeFromProviders({ cleanable }, '_')

    const handlers: (() => Promise<void>)[] = []
    const env = { onKill: cb => (handlers.push(cb), () => {}) }
    const kill = async () => {
      for (const handler of handlers) {
        await handler()
      }
    }

    await Promise.race([
      new SandBox(
        () => new Prompt(new Value('whatever')) as any,
        {},
        {},
        scope,
        new Flow(env),
      ).execute(),
      (async () => {
        await sleep(1)
        await kill()

        expect(cleanable.cleanup).not.toHaveBeenCalled()
        expect(isolatedCleanup).toHaveBeenCalled()
      })()
    ])
  })

  test('throws proper error when command has not produced the output name.', async () => {
    const sandbox = new SandBox(
      () => new Steps([]),
      {},
      {x: 'x'},
      scopeFromProviders({}, '_'),
      new Flow({ onKill: () => () => {} })
    )
    await expect(async () => await sandbox.execute()).rejects.toThrow(ReferenceError)
  })

  test('properly traces argument runnables while evaluating them lazily.', async () => {
    const scope = scopeFromProviders({}, '_')
    const sandbox = new SandBox(
      s => new Steps([
        new RA(s),
        new RC(new RB(s)),
      ]),
      {
        a: new RArg1(),
        b: new RArg2(),
      },
      {
      },
      scope,
      new Flow({ onKill: () => () => {} }),
    )

    const trace = sandbox.trace()
    await trace.result

    expect(trace.stacks[0]!.peek()).toBe(sandbox)
    expect(trace.stacks[1]!.peek()).toBeInstanceOf(StepsExecution)
    expect(trace.stacks[1]!.parent()).toBe(sandbox)
    expect(trace.stacks[2]!.peek()).toBeInstanceOf(ExA)
    expect(trace.stacks[2]!.parent()).toBeInstanceOf(StepsExecution)
    expect(trace.stacks[3]!.peek()).toBeInstanceOf(ExArg1)
    expect(trace.stacks[3]!.parent()).toBeInstanceOf(ExA)
    expect(trace.stacks[4]!.peek()).toBeInstanceOf(ExA)
    expect(trace.stacks[5]!.peek()).toBeInstanceOf(StepsExecution)
    expect(trace.stacks[6]!.peek()).toBeInstanceOf(ExC)
    expect(trace.stacks[6]!.parent()).toBeInstanceOf(StepsExecution)
    expect(trace.stacks[7]!.peek()).toBeInstanceOf(ExB)
    expect(trace.stacks[7]!.parent()).toBeInstanceOf(ExC)
    expect(trace.stacks[8]!.peek()).toBeInstanceOf(ExArg2)
    expect(trace.stacks[8]!.parent()).toBeInstanceOf(ExB)
    expect(trace.stacks[9]!.peek()).toBeInstanceOf(ExB)
    expect(trace.stacks[10]!.peek()).toBeInstanceOf(ExC)
    expect(trace.stacks[11]!.peek()).toBeInstanceOf(StepsExecution)
    expect(trace.stacks[12]!.peek()).toBe(sandbox)
  })
})
