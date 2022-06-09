import { Read } from '../command/read'
import { Eval } from '../expr/eval'
import { Steps, StepsExecution } from '../command/steps'
import { Runnable } from '../runnable'
import { Execution } from '../execution'
import { SandBox } from '../sandbox'
import { CleanableProvider, providerFromFunctions, Scope, scopeFromProviders } from '../scope'
import { EvaluationContext } from '../eval/context'


class ExA extends Execution<void> {
  constructor(readonly R: RA) { super() }
  async run() { await this.R.scope.get('args.a') }
}

class RA extends Runnable<void> {
  constructor(readonly scope: Scope) { super() }
  run() { return new ExA(this) }
}

class ExB extends Execution<void> {
  constructor(readonly R: RB) { super() }
  async run() { await this.R.scope.get('args.b') }
}

class RB extends Runnable<void> {
  constructor(readonly scope: Scope) { super() }
  run() { return new ExB(this) }
}

class ExC extends Execution<void> {
  constructor(readonly R: RC) { super() }
  async run() { await this.delegate(this.R.rb.run()) }
}

class RC extends Runnable<void> {
  constructor(readonly rb: RB) { super() }
  run() { return new ExC(this) }
}

class ExArg1 extends Execution<string> { async run() { return 'a' } }
class RArg1 extends Runnable<string> { run() { return new ExArg1 }}
class ExArg2 extends Execution<string> { async run() { return 'b' } }
class RArg2 extends Runnable<string> { run() { return new ExArg2 }}


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
    await new SandBox(() => new Steps([]), {}, {}, scope).execute()

    expect(cleanable.cleanup).not.toHaveBeenCalled()
    expect(isolatedCleanup).toHaveBeenCalled()
  })

  test('throws proper error when command has not produced the output name.', async () => {
    const sandbox = new SandBox(() => new Steps([]), {}, {x: 'x'}, scopeFromProviders({}, '_'))
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
      scope
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
