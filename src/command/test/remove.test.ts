import { isAbsolute, join, normalize } from 'path/posix'

import { FileSystem } from '../../filesystem'
import { Value } from '../../expr/value'
import { Remove } from '../remove'
import { ChangeLog } from '../change'
import { Flow } from '../../flow'


describe(Remove, () => {
  test('removes file.', async () => {
    const dummyFS: FileSystem = {
      read: jest.fn(),
      write: jest.fn(),
      absolute: jest.fn(x => normalize(x)),
      basename: jest.fn(),
      dirname: jest.fn(),
      ls: jest.fn(() => Promise.resolve(['some/path', 'some/other/path'])),
      rm: jest.fn(),
      access: jest.fn(),
      fetch: jest.fn(),
      cd: jest.fn(),
      scope: '',
      root: '',
    }

    const log = new ChangeLog()

    await new Remove(
      new Value('some/path'),
      dummyFS,
      { log }
    ).run(new Flow()).execute()

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
      absolute: jest.fn(x => normalize(x)),
      basename: jest.fn(),
      dirname: jest.fn(),
      ls: jest.fn(async () => files),
      rm: jest.fn(async (file) => { files.splice(files.indexOf(file), 1) }),
      access: jest.fn(),
      fetch: jest.fn(),
      cd: jest.fn(),
      scope: '',
      root: '',
    }

    await new Remove(
      new Value('some/**/*.js'),
      dummyFS,
    ).run(new Flow()).execute()

    expect(files).toEqual([
      'some/path.ts',
      'other/path/stuff.js'
    ])
  })

  test('can handle relative paths.', async () => {
    const files = [
      '/user/some/path.js',
      '/user/some/other/path.js',
      '/user/some/path.ts',
      '/user/other/path/stuff.js',
    ]

    const dummyFS: FileSystem = {
      read: jest.fn(),
      write: jest.fn(),
      absolute: jest.fn(x => normalize(isAbsolute(x) ? x : join('/user', x))),
      basename: jest.fn(),
      dirname: jest.fn(),
      ls: jest.fn(async () => files.map(file => file.slice(6))),
      rm: jest.fn(async (file) => { files.splice(files.indexOf(file), 1) }),
      access: jest.fn(),
      fetch: jest.fn(),
      cd: jest.fn(),
      scope: '/user',
      root: '/user',
    }

    await new Remove(
      new Value('./some/**/*.js'),
      dummyFS,
    ).run(new Flow()).execute()

    expect(files).toEqual([
      '/user/some/path.ts',
      '/user/other/path/stuff.js'
    ])
  })

  test('can remove folders.', async () => {
    const dummyFS: FileSystem = {
      read: jest.fn(),
      absolute: jest.fn(x => x),
      write: jest.fn(),
      basename: jest.fn(),
      dirname: jest.fn(),
      ls: jest.fn(async () => ['some/path', 'some/other/path', 'some/other/path2']),
      rm: jest.fn(),
      access: jest.fn(),
      fetch: jest.fn(),
      cd: jest.fn(),
      scope: '',
      root: '',
    }

    await new Remove(
      new Value('some/other'),
      dummyFS,
    ).run(new Flow()).execute()

    expect(dummyFS.rm).toHaveBeenCalledWith('some/other')
  })

  test('ignores hidden files when hidden is false.', async () => {
    const dummyFS: FileSystem = {
      read: jest.fn(),
      absolute: jest.fn(x => x),
      write: jest.fn(),
      basename: jest.fn(),
      dirname: jest.fn(),
      ls: jest.fn(async () => ['some/path', 'some/.other/path', 'some/.third-thing']),
      rm: jest.fn(),
      access: jest.fn(),
      fetch: jest.fn(),
      cd: jest.fn(),
      scope: '',
      root: '',
    }

    await new Remove(
      new Value('some/**/*'),
      dummyFS,
    ).run(new Flow()).execute()

    expect(dummyFS.rm).toHaveBeenCalledWith('some/path')
    expect(dummyFS.rm).not.toHaveBeenCalledWith('some/.other/path')
    expect(dummyFS.rm).not.toHaveBeenCalledWith('some/.third-thing')
  })

  test('removes hidden files when hidden is true.', async () => {
    const dummyFS: FileSystem = {
      read: jest.fn(),
      absolute: jest.fn(x => x),
      write: jest.fn(),
      basename: jest.fn(),
      dirname: jest.fn(),
      ls: jest.fn(async () => ['some/path', 'some/.other/path', 'some/.third-thing']),
      rm: jest.fn(),
      access: jest.fn(),
      fetch: jest.fn(),
      cd: jest.fn(),
      scope: '',
      root: '',
    }

    await new Remove(
      new Value('some/**/*'),
      dummyFS,
      { hidden: true },
    ).run(new Flow()).execute()

    expect(dummyFS.rm).toHaveBeenCalledWith('some/path')
    expect(dummyFS.rm).toHaveBeenCalledWith('some/.other/path')
    expect(dummyFS.rm).toHaveBeenCalledWith('some/.third-thing')
  })
})
