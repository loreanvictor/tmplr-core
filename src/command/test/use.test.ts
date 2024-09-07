import { basename, dirname } from 'path/posix'
import sleep from 'sleep-promise'

import { Read } from '../read'
import { Value } from '../../expr/value'
import { Prompt } from '../../expr/prompt'
import { Eval } from '../../expr/eval'
import { FileSystem } from '../../filesystem'
import { providerFromFunctions, Scope, scopeFromProviders } from '../../scope'
import { Use } from '../use'
import { EvaluationContext } from '../../eval/context'
import { Flow } from '../../flow'
import { Steps } from '../steps'


describe(Use, () => {
  test('fetches target repo, and runs its recipe.', async () => {
    let tmpdir = ''

    const dummyFS: FileSystem = {
      root: '/home',
      scope: '/home',
      dirname: (path: string) => dirname(path),
      basename: (path: string) => basename(path),
      absolute: (path: string) => path,
      ls: async () => [],
      cd: jest.fn(() => dummyFS2),
      read: jest.fn(async file => {
        expect(file).toMatch(/recipe\.yml$/)

        return 'content of the file'
      }),
      write: jest.fn(() => Promise.resolve()),
      access: jest.fn(() => Promise.resolve()),
      rm: jest.fn(async dir => {
        expect(dir).toBe(tmpdir)
      }),
      fetch: jest.fn(async (target, dir) => {
        expect(target).toBe('some:repo')
        tmpdir = dir
      }),
    }

    const dummyFS2 = { ...dummyFS }
    const scope = scopeFromProviders({
      things: providerFromFunctions({ foo: async () => 'bar' }),
    }, '_', { foo: 'bar' })
    await scope.set('baz', 'qux')

    let received: Scope = {} as any

    const parse = (content: string, filename: string, s: Scope, ctx: EvaluationContext, filesystem: FileSystem) => {
      expect(content).toBe('content of the file')
      expect(filename).toBe('recipe.yml')
      expect(filesystem).toBe(dummyFS2)
      received = s

      return new Read(
        'out',
        new Eval('hellow {{ args.a }} - {{ filesystem.scopedir }}', ctx),
        s
      )
    }

    const use = new Use(
      new Value('some:repo'),
      parse,
      dummyFS,
      scope,
      new EvaluationContext(scope),
      {
        recipe: new Value('recipe.yml'),
        inputs: { a: new Value('world') },
        outputs: { b: 'out' },
      }
    )

    await use.run(new Flow({ onKill: () => () => {} })).execute()

    expect(dummyFS.fetch).toHaveBeenCalled()
    expect(dummyFS.read).toHaveBeenCalled()
    expect(dummyFS.rm).toHaveBeenCalled()

    await expect(scope.has('b')).resolves.toBe(true)
    await expect(scope.get('b')).resolves.toBe('hellow world - home')
    await expect(scope.has('out')).resolves.toBe(false)

    await expect(received.has('foo')).resolves.toBe(true)
    await expect(received.has('things.foo')).resolves.toBe(true)
    await expect(received.has('baz')).resolves.toBe(false)
  })

  test('without any recipe, assumes .tmplr.yml', async () => {
    const dummyFS: FileSystem = {
      root: '', scope: '',
      dirname: jest.fn(), basename: jest.fn(), absolute: jest.fn(),
      ls: jest.fn(), read: jest.fn(), write: jest.fn(), access: jest.fn(), rm: jest.fn(),
      fetch: jest.fn(),

      cd: () => dummyFS
    }

    const scope = scopeFromProviders({}, '_', { foo: 'bar' })
    const parse = jest.fn(() => new Steps([]))

    await new Use(
      new Value('some:repo'),
      parse,
      dummyFS,
      scope,
      new EvaluationContext(scope),
    ).run(new Flow({ onKill: () => () => {} })).execute()

    expect(parse).toHaveBeenCalledWith(
      undefined,
      '.tmplr.yml',
      expect.anything(),
      expect.anything(),
      expect.anything(),
      undefined
    )
  })

  test('will cleanup on kill.', async () => {
    const dummyFS: FileSystem = {
      root: '', scope: '',
      dirname: jest.fn(), basename: jest.fn(), absolute: jest.fn(),
      ls: jest.fn(), read: jest.fn(), write: jest.fn(), access: jest.fn(), rm: jest.fn(),
      fetch: jest.fn(),

      cd: () => dummyFS
    }

    const scope = scopeFromProviders({}, '_', { foo: 'bar' })
    const parse = () => new Prompt(new Value('foo')) as any

    const handlers: (() => Promise<void>)[] = []
    const flow = new Flow({ onKill: (cb) => (handlers.push(cb), () => {})})
    const kill = async () => {
      for (const handler of handlers) {
        await handler()
      }
    }

    await Promise.race([
      new Use(
        new Value('some:repo'),
        parse,
        dummyFS,
        scope,
        new EvaluationContext(scope),
      ).run(flow).execute(),
      (async () => {
        await sleep(1)
        await kill()

        expect(dummyFS.rm).toHaveBeenCalled()
        expect((dummyFS.rm as jest.Mock).mock.calls[0][0]).toMatch('.use-')
      })()
    ])
  })
})
