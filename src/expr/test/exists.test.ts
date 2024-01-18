import { FileSystem } from '../../filesystem'
import { Flow } from '../../flow'
import { Exists } from '../exists'
import { Value } from '../value'


describe(Exists, () => {
  test('checks if a file exists', async () => {
    const dummyFS: FileSystem = {
      root: '/',
      scope: '/',
      async ls() { return [
        '/package.json',
        '/src/index.js',
        '/src/expr/index.ts',
      ] },
      absolute: x => x.startsWith('/') ? x : `/${x}`,
      read: jest.fn(), write: jest.fn(), rm: jest.fn(),
      access: jest.fn(), fetch: jest.fn(), cd: jest.fn(),
      basename: jest.fn(), dirname: jest.fn(),
    }

    const exists = new Exists(new Value('package.json'), dummyFS)
    const result = await exists.run(new Flow({ onKill: jest.fn() })).execute()

    expect(result).toBe('/package.json')
  })

  test('returns an empty string when no file found.', async () => {
    const dummyFS: FileSystem = {
      root: '/',
      scope: '/',
      async ls() { return [
        '/package.json',
        '/src/index.js',
        '/src/.expr/index.ts',
      ] },
      absolute: x => x.startsWith('/') ? x : `/${x}`,
      read: jest.fn(), write: jest.fn(), rm: jest.fn(),
      access: jest.fn(), fetch: jest.fn(), cd: jest.fn(),
      basename: jest.fn(), dirname: jest.fn(),
    }

    const exists = new Exists(new Value('**/*.ts'), dummyFS)
    const result = await exists.run(new Flow({ onKill: jest.fn() })).execute()

    expect(result).toBe('')
  })

  test('can search hidden files too.', async () => {
    const dummyFS: FileSystem = {
      root: '/',
      scope: '/',
      async ls() { return [
        '/package.json',
        '/src/index.js',
        '/src/.expr/index.ts',
      ] },
      absolute: x => x.startsWith('/') ? x : `/${x}`,
      read: jest.fn(), write: jest.fn(), rm: jest.fn(),
      access: jest.fn(), fetch: jest.fn(), cd: jest.fn(),
      basename: jest.fn(), dirname: jest.fn(),
    }

    const exists = new Exists(new Value('**/*.ts'), dummyFS, { hidden: true })
    const result = await exists.run(new Flow({ onKill: jest.fn() })).execute()

    expect(result).toBe('/src/.expr/index.ts')
  })
})
