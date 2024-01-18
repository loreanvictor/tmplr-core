import { isAbsolute, join, normalize } from 'path/posix'

import { FileSystem } from '../../filesystem'
import { Value } from '../../expr/value'
import { EvaluationContext } from '../../eval'
import { scopeFromProviders } from '../../scope'
import { Copy } from '../copy'
import { ChangeLog } from '../change'
import { Flow } from '../../flow'


describe(Copy, () => {
  test('copies file while evaluating its content.', async () => {
    const dummyFS: FileSystem = {
      read: jest.fn(async () => 'hellow {{ _.name }}, how is {{ _.other }}?'),
      write: jest.fn(),
      ls: jest.fn(async () => ['some/path']),
      absolute: jest.fn(x => normalize(x)),
      basename: jest.fn(),
      dirname: jest.fn(),
      rm: jest.fn(),
      access: jest.fn(),
      fetch: jest.fn(),
      cd: jest.fn(),
      scope: '',
      root: '',
    }

    const scope = scopeFromProviders({}, '_', { name: 'world' })
    const context = new EvaluationContext(scope.vars)
    const log = new ChangeLog()

    await new Copy(
      new Value('some/path'),
      new Value('some/other/path'),
      dummyFS,
      context,
      { log }
    ).run(new Flow({ onKill: jest.fn() })).execute()

    expect(dummyFS.write).toHaveBeenCalledWith('some/other/path', 'hellow world, how is {{ _.other }}?')
    expect(log.entries()[0]!.details['source']).toBe('some/path')
    expect(log.entries()[0]!.details['dest']).toBe('some/other/path')
  })

  test('can copy multiple files.', async () => {
    const files = {
      'some/path.js': 'aaa',
      'some/other/path.js': 'bbb {{ _.name }}',
      'other/stuff.js': 'ccc',
      'some/stuff.ts': 'ddd',
    }

    const dummyFS: FileSystem = {
      read: jest.fn(async (path) => files[path]),
      write: jest.fn(async (path, content) => { files[path] = content }),
      ls: jest.fn(async () => Object.keys(files)),
      absolute: jest.fn(x => normalize(x)),
      basename: jest.fn(),
      dirname: jest.fn(),
      rm: jest.fn(),
      access: jest.fn(),
      fetch: jest.fn(),
      cd: jest.fn(),
      scope: '',
      root: '',
    }

    const scope = scopeFromProviders({}, '_', { name: 'world' })
    const context = new EvaluationContext(scope.vars)

    await new Copy(
      new Value('some/**/*.js'),
      new Value('target'),
      dummyFS,
      context
    ).run(new Flow({ onKill: jest.fn() })).execute()

    expect(files['target/path.js']).toBe('aaa')
    expect(files['target/other/path.js']).toBe('bbb world')
    expect(files['target/stuff.ts']).toBeUndefined()
    expect(files['target/other/stuff.js']).toBeUndefined()
  })

  test('can handle relative paths.', async () => {
    const files = {
      '/user/some/path.js': 'aaa',
      '/user/some/other/path.js': 'bbb {{ _.name }}',
      '/user/other/stuff.js': 'ccc',
      '/user/some/stuff.ts': 'ddd',
    }

    const dummyFS: FileSystem = {
      read: jest.fn(async (path) => files[path]),
      write: jest.fn(async (path, content) => { files[path] = content }),
      ls: jest.fn(async () => Object.keys(files).map(file => file.slice(6))),
      absolute: jest.fn(x => normalize(isAbsolute(x) ? x : join('/user', x))),
      basename: jest.fn(),
      dirname: jest.fn(),
      rm: jest.fn(),
      access: jest.fn(),
      fetch: jest.fn(),
      cd: jest.fn(),
      scope: '/user',
      root: '/user',
    }

    const scope = scopeFromProviders({}, '_', { name: 'world' })
    const context = new EvaluationContext(scope.vars)

    await new Copy(
      new Value('./some/**/*.js'),
      new Value('./target'),
      dummyFS,
      context
    ).run(new Flow({ onKill: jest.fn() })).execute()

    expect(files['/user/target/path.js']).toBe('aaa')
    expect(files['/user/target/other/path.js']).toBe('bbb world')
    expect(files['/user/target/stuff.ts']).toBeUndefined()
    expect(files['/user/target/other/stuff.js']).toBeUndefined()
  })

  test('ignores hidden paths when hidden is false.', async () => {
    const files = {
      '/user/some/path.js': 'aaa',
      '/user/some/.other/path.js': 'bbb',
      '/user/some/.other-stuff.js': 'ccc'
    }

    const dummyFS: FileSystem = {
      read: jest.fn(async (path) => files[path]),
      write: jest.fn(async (path, content) => { files[path] = content }),
      ls: jest.fn(async () => Object.keys(files).map(file => file.slice(6))),
      absolute: jest.fn(x => normalize(isAbsolute(x) ? x : join('/user', x))),
      basename: jest.fn(),
      dirname: jest.fn(),
      rm: jest.fn(),
      access: jest.fn(),
      fetch: jest.fn(),
      cd: jest.fn(),
      scope: '/user',
      root: '/user',
    }

    const scope = scopeFromProviders({}, '_', { name: 'world' })
    const context = new EvaluationContext(scope.vars)

    await new Copy(
      new Value('./some/**/*.js'),
      new Value('./target'),
      dummyFS,
      context
    ).run(new Flow({ onKill: jest.fn() })).execute()

    expect(files['/user/target/path.js']).toBe('aaa')
    expect(files['/user/target/.other/path.js']).toBeUndefined()
    expect(files['/user/target/.other-stuff.js']).toBeUndefined()
  })

  test('copies hidden paths when hidden is true.', async () => {
    const files = {
      '/user/some/path.js': 'aaa',
      '/user/some/.other/path.js': 'bbb',
      '/user/some/.other-stuff.js': 'ccc'
    }

    const dummyFS: FileSystem = {
      read: jest.fn(async (path) => files[path]),
      write: jest.fn(async (path, content) => { files[path] = content }),
      ls: jest.fn(async () => Object.keys(files).map(file => file.slice(6))),
      absolute: jest.fn(x => normalize(isAbsolute(x) ? x : join('/user', x))),
      basename: jest.fn(),
      dirname: jest.fn(),
      rm: jest.fn(),
      access: jest.fn(),
      fetch: jest.fn(),
      cd: jest.fn(),
      scope: '/user',
      root: '/user',
    }

    const scope = scopeFromProviders({}, '_', { name: 'world' })
    const context = new EvaluationContext(scope.vars)

    await new Copy(
      new Value('./some/**/*.js'),
      new Value('./target'),
      dummyFS,
      context,
      { hidden: true }
    ).run(new Flow({ onKill: jest.fn() })).execute()

    expect(files['/user/target/path.js']).toBe('aaa')
    expect(files['/user/target/.other/path.js']).toBe('bbb')
    expect(files['/user/target/.other-stuff.js']).toBe('ccc')
  })
})
