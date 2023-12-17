import { basename, dirname } from 'path/posix'

import { Read } from '../read'
import { Steps } from '../steps'
import { Value } from '../../expr/value'
import { Eval } from '../../expr/eval'
import { FileSystem } from '../../filesystem'
import { providerFromFunctions, Scope, scopeFromProviders } from '../../scope'
import { Run } from '../run'
import { EvaluationContext } from '../../eval/context'
import { Flow } from '../../flow'
import { Execution } from '../../execution'
import { Runnable } from '../../runnable'


class DummyExec extends Execution<void> {
  constructor(readonly _run: DummyRunnable, flow: Flow) { super(flow) }
  async run() { this._run.fn() }
}


class DummyRunnable extends Runnable<void> {
  constructor(readonly fn: () => {}) { super() }
  run(flow: Flow) { return new DummyExec(this, flow) }
}


describe(Run, () => {
  test('reads target file and runs it.', async () => {
    const dummyFS: FileSystem = {
      root: '/home',
      scope: '/home',
      basename: (path: string) => basename(path),
      dirname: (path: string) => dirname(path),
      absolute: (path: string) => path,
      ls: async () => [],
      cd: jest.fn(() => dummyFS2),
      read: jest.fn(() => Promise.resolve('content of the file')),
      write: jest.fn(() => Promise.resolve()),
      access: jest.fn(() => Promise.resolve()),
      rm: jest.fn(() => Promise.resolve()),
      fetch: jest.fn(() => Promise.resolve()),
    }

    const dummyFS2 = { ...dummyFS, root: '/home/some', scope: '/home' }
    const scope = scopeFromProviders({
      things: providerFromFunctions({ foo: async () => 'bar' }),
    }, '_', { foo: 'bar' })
    await scope.set('baz', 'qux')

    let received: Scope = {} as any

    const parse = (content: string, filename: string, s: Scope, ctx: EvaluationContext, filesystem: FileSystem) => {
      expect(content).toBe('content of the file')
      expect(filename).toBe('some/file.yml')
      expect(filesystem).toBe(dummyFS2)
      received = s

      return new Steps([
        new Read(
          'out',
          new Eval('hellow {{ args.a }}', ctx),
          s
        ),
        new Read(
          'out2',
          new Eval('{{ filesystem.scope }} - {{ filesystem.rootdir }}', ctx),
          s
        )
      ])
    }

    const run = new Run(
      new Value('some/file.yml'),
      parse,
      dummyFS,
      scope,
      new EvaluationContext(scope),
      {
        inputs: { a: new Value('world') },
        outputs: { b: 'out', c: 'out2' },
      }
    )

    await run.run(new Flow()).execute()

    expect(dummyFS.cd).toHaveBeenCalledWith('some')
    await expect(scope.has('b')).resolves.toBe(true)
    await expect(scope.get('b')).resolves.toBe('hellow world')
    await expect(scope.has('c')).resolves.toBe(true)
    await expect(scope.get('c')).resolves.toBe('/home - some')
    await expect(scope.has('out')).resolves.toBe(false)
    await expect(scope.has('out2')).resolves.toBe(false)

    await expect(received.has('foo')).resolves.toBe(true)
    await expect(received.has('things.foo')).resolves.toBe(true)
    await expect(received.has('baz')).resolves.toBe(false)
  })

  test('can be run without inputs and outputs.', async() => {
    const dummyFS: FileSystem = {
      root: '/',
      scope: '/',
      basename: jest.fn(),
      dirname: jest.fn(),
      absolute: jest.fn(),
      ls: jest.fn(),
      cd: jest.fn(),
      read: jest.fn(() => Promise.resolve('content of the file')),
      write: jest.fn(),
      access: jest.fn(),
      rm: jest.fn(),
      fetch: jest.fn(),
    }

    const target = jest.fn()

    const parse = () => new Steps([
      new DummyRunnable(target),
      new DummyRunnable(target),
    ])

    const scope = scopeFromProviders({}, '_', {})

    await new Run(
      new Value('some/file.yml'),
      parse,
      dummyFS,
      scope,
      new EvaluationContext(scope),
    ).run(new Flow()).execute()

    expect(target).toHaveBeenCalledTimes(2)
  })
})
