import { Read } from '../read'
import { Value } from '../../expr/value'
import { Eval } from '../../expr/eval'
import { FileSystem } from '../../filesystem'
import { providerFromFunctions, Scope, scopeFromProviders } from '../../scope'
import { Run } from '../run'
import { EvaluationContext } from '../../eval/context'
import { ChangeLog } from '../change'


describe(Run, () => {
  test('reads target file and runs it.', async () => {
    const dummyFS: FileSystem = {
      root: '/home',
      scope: '/home',
      absolute: (path: string) => path,
      cd: jest.fn(() => dummyFS2),
      read: jest.fn(() => Promise.resolve('content of the file')),
      write: jest.fn(() => Promise.resolve()),
      access: jest.fn(() => Promise.resolve()),
      rm: jest.fn(() => Promise.resolve()),
      fetch: jest.fn(() => Promise.resolve()),
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

    const run = new Run(
      new Value('some/file.yml'),
      { a: new Value('world') },
      { b: 'out' },
      parse,
      dummyFS,
      scope,
      new EvaluationContext(scope),
      new ChangeLog(),
    )

    await run.run().execute()

    await expect(scope.has('b')).resolves.toBe(true)
    await expect(scope.get('b')).resolves.toBe('hellow world')
    await expect(scope.has('out')).resolves.toBe(false)

    await expect(received.has('foo')).resolves.toBe(true)
    await expect(received.has('things.foo')).resolves.toBe(true)
    await expect(received.has('baz')).resolves.toBe(false)
  })
})
