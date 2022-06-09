import { Read } from '../read'
import { Value } from '../../expr/value'
import { Eval } from '../../expr/eval'
import { FileSystem } from '../../filesystem'
import { providerFromFunctions, Scope, scopeFromProviders } from '../../scope'
import { Use } from '../use'
import { EvaluationContext } from '../../eval/context'
import { ChangeLog } from '../change'


describe(Use, () => {
  test('fetches target repo, and runs its recipe.', async () => {
    let tmpdir = ''

    const dummyFS: FileSystem = {
      root: '/home',
      scope: '/home',
      absolute: (path: string) => path,
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

    const parse = (content: string, s: Scope, ctx: EvaluationContext, filesystem: FileSystem) => {
      expect(content).toBe('content of the file')
      expect(filesystem).toBe(dummyFS2)
      received = s

      return new Read(
        'out',
        new Eval('hellow {{ args.a }}', ctx),
        s
      )
    }

    const use = new Use(
      new Value('some:repo'),
      new Value('recipe.yml'),
      { a: new Value('world') },
      { b: 'out' },
      parse,
      dummyFS,
      scope,
      new EvaluationContext(scope),
      new ChangeLog(),
    )

    await use.run().execute()

    expect(dummyFS.fetch).toHaveBeenCalled()
    expect(dummyFS.read).toHaveBeenCalled()
    expect(dummyFS.rm).toHaveBeenCalled()

    await expect(scope.has('b')).resolves.toBe(true)
    await expect(scope.get('b')).resolves.toBe('hellow world')
    await expect(scope.has('out')).resolves.toBe(false)

    await expect(received.has('foo')).resolves.toBe(true)
    await expect(received.has('things.foo')).resolves.toBe(true)
    await expect(received.has('baz')).resolves.toBe(false)
  })
})
