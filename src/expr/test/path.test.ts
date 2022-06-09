import { FileSystem } from '../../filesystem'
import { Value } from '../value'
import { Path } from '../path'


describe(Path, () => {
  test('returns absolute path.', async () => {
    const dummyFS: FileSystem = {
      read: jest.fn(),
      write: jest.fn(),
      absolute: jest.fn(path => '/abs/' + path),
      rm: jest.fn(),
      access: jest.fn(),
      fetch: jest.fn(),
      cd: jest.fn(),
      scope: 'scope',
      root: 'root',
    }

    await expect(new Path(
      new Value('some/path'),
      dummyFS,
    ).run().execute()).resolves.toBe('/abs/some/path')

    expect(dummyFS.absolute).toHaveBeenCalledWith('some/path')
  })
})
