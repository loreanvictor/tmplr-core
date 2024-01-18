import { FileSystem } from '../../filesystem'
import { Flow } from '../../flow'
import { FromFile } from '../from-file'
import { Value } from '../value'


describe(FromFile, () => {
  test('reads content of given file', async () => {
    const dummyFS: FileSystem = {
      root: '/',
      scope: '/',
      absolute: x => x.startsWith('/') ? x : `/${x}`,
      read: async file => {
        if (file === '/package.json') {
          return JSON.stringify({ name: 'test' })
        } else {
          throw new Error('File not found.')
        }
      },
      ls: jest.fn(), write: jest.fn(), rm: jest.fn(),
      access: jest.fn(), fetch: jest.fn(), cd: jest.fn(),
      basename: jest.fn(), dirname: jest.fn(),
    }

    const exists = new FromFile(new Value('package.json'), dummyFS)
    const result = await exists.run(new Flow({ onKill: jest.fn() })).execute()

    expect(result).toBe(JSON.stringify({ name: 'test' }))
  })

  test('returns empty string when file does not exist.', async () => {
    const dummyFS: FileSystem = {
      root: '/',
      scope: '/',
      absolute: x => x.startsWith('/') ? x : `/${x}`,
      read: async file => {
        if (file === '/package.json') {
          return JSON.stringify({ name: 'test' })
        } else {
          throw new Error('File not found.')
        }
      },
      ls: jest.fn(), write: jest.fn(), rm: jest.fn(),
      access: jest.fn(), fetch: jest.fn(), cd: jest.fn(),
      basename: jest.fn(), dirname: jest.fn(),
    }

    const exists = new FromFile(new Value('README.md'), dummyFS)
    const result = await exists.run(new Flow({ onKill: jest.fn() })).execute()

    expect(result).toBe('')
  })
})
