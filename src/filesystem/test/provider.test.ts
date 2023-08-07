import { basename, dirname } from 'path'

import { FileSystem } from '../types'
import { createFSProvider } from '../provider'
import { sourceFromProviders } from '../../scope'


describe(createFSProvider, () => {
  test('provides root and scope information of given filesystem.', async () => {
    const dummyFS: FileSystem = {
      root: '/home/stuff',
      scope: '/home',
      basename: (path: string) => basename(path),
      dirname: (path: string) => dirname(path),
      absolute: (path: string) => path,
      ls: async () => [],
      cd: jest.fn(() => dummyFS),
      read: jest.fn(() => Promise.resolve('content of the file')),
      write: jest.fn(() => Promise.resolve()),
      access: jest.fn(() => Promise.resolve()),
      rm: jest.fn(() => Promise.resolve()),
      fetch: jest.fn(() => Promise.resolve()),
    }

    const source = sourceFromProviders({ filesystem: createFSProvider(dummyFS) })

    await expect(source.has('filesystem.root')).resolves.toBe(true)
    await expect(source.has('filesystem.scope')).resolves.toBe(true)
    await expect(source.has('filesystem.rootdir')).resolves.toBe(true)
    await expect(source.has('filesystem.scopedir')).resolves.toBe(true)

    await expect(source.get('filesystem.root')).resolves.toBe('/home/stuff')
    await expect(source.get('filesystem.scope')).resolves.toBe('/home')
    await expect(source.get('filesystem.rootdir')).resolves.toBe('stuff')
    await expect(source.get('filesystem.scopedir')).resolves.toBe('home')
  })
})
