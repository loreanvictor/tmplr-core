import { Read } from '../read'
import { Value } from '../../expr/value'
import { Eval } from '../../expr/eval'
import { FileSystem } from '../../filesystem'
import { providerFromFunctions, Scope, scopeFromProviders } from '../../scope'
import { Run } from '../run'
import { EvaluationContext } from '../../eval/context'


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
    }

    const dummyFS2 = { ...dummyFS }
    const scope = scopeFromProviders({
      things: providerFromFunctions({ foo: async () => 'bar' }),
    }, '_', { foo: 'bar' })
    await scope.set('baz', 'qux')

    const parse = (content: string, filesystem: FileSystem, s: Scope) => {
      expect(content).toBe('content of the file')
      expect(filesystem).toBe(dummyFS2)
      expect(s.has('foo')).toBe(true)
      expect(s.has('things.foo')).toBe(true)
      expect(s.has('baz')).toBe(false)

      return new Read(
        'out',
        new Eval('hellow {{ args.a }}', new EvaluationContext(s)),
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
    )

    await run.run().execute()

    expect(scope.has('b')).toBe(true)
    await expect(scope.get('b')).resolves.toBe('hellow world')
    expect(scope.has('out')).toBe(false)
  })
})
