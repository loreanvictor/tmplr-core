import { FileSystem } from '../../filesystem'
import { Value } from '../../expr/value'
import { Remove } from '../remove'
import { ChangeLog } from '../change'


describe(Remove, () => {
  test('removes file.', async () => {
    const dummyFS: FileSystem = {
      read: jest.fn(),
      write: jest.fn(),
      absolute: jest.fn(),
      basename: jest.fn(),
      dirname: jest.fn(),
      ls: jest.fn(() => Promise.resolve(['some/path', 'some/other/path'])),
      rm: jest.fn(),
      access: jest.fn(),
      fetch: jest.fn(),
      cd: jest.fn(),
      scope: 'scope',
      root: 'root',
    }

    const log = new ChangeLog()

    await new Remove(
      new Value('some/path'),
      dummyFS,
      log,
    ).run().execute()

    expect(dummyFS.rm).toHaveBeenCalledWith('some/path')
    expect(dummyFS.rm).not.toHaveBeenCalledWith('some/other/path')
    expect(log.entries()[0]!.details['target']).toBe('some/path')
  })

  test('can remove files based on a glob pattern.', async () => {
    const files = [
      'some/path.js',
      'some/other/path.js',
      'some/path.ts',
      'other/path/stuff.js',
    ]

    const dummyFS: FileSystem = {
      read: jest.fn(),
      write: jest.fn(),
      absolute: jest.fn(),
      basename: jest.fn(),
      dirname: jest.fn(),
      ls: jest.fn(async () => files),
      rm: jest.fn(async (file) => { files.splice(files.indexOf(file), 1) }),
      access: jest.fn(),
      fetch: jest.fn(),
      cd: jest.fn(),
      scope: 'scope',
      root: 'root',
    }

    await new Remove(
      new Value('some/**/*.js'),
      dummyFS,
      new ChangeLog(),
    ).run().execute()

    expect(files).toEqual([
      'some/path.ts',
      'other/path/stuff.js'
    ])
  })
})
