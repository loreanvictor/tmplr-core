import { dirname, basename } from 'path'

import { FileSystem } from '../../filesystem'
import { Value } from '../value'
import { Path } from '../path'
import { Flow } from '../../flow'


describe(Path, () => {
  test('returns absolute path.', async () => {
    const dummyFS: FileSystem = {
      read: jest.fn(),
      write: jest.fn(),
      absolute: jest.fn(path => '/abs/' + path),
      basename: jest.fn(path => basename(path)),
      dirname: jest.fn(path => dirname(path)),
      rm: jest.fn(),
      ls: jest.fn(),
      access: jest.fn(),
      fetch: jest.fn(),
      cd: jest.fn(),
      scope: 'scope',
      root: 'root',
    }

    await expect(new Path(
      new Value('some/path'),
      dummyFS,
    ).run(new Flow({ onKill: jest.fn() })).execute()).resolves.toBe('/abs/some/path')

    expect(dummyFS.absolute).toHaveBeenCalledWith('some/path')
  })
})
