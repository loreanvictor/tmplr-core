import { normalize, join, isAbsolute } from 'path'

import { FileSystem } from '../../filesystem'
import { Value } from '../../expr/value'
import { EvaluationContext } from '../../eval'
import { scopeFromProviders } from '../../scope'
import { Update } from '../update'
import { ChangeLog } from '../change'


describe(Update, () => {
  test('updates file, evaluating its content.', async () => {
    const dummyFS: FileSystem = {
      read: jest.fn(async () => 'hellow {{ _.name }}, how is {{ _.other }}?'),
      write: jest.fn(),
      absolute: jest.fn(x => normalize(x)),
      dirname: jest.fn(),
      basename: jest.fn(),
      ls: jest.fn(async () => ['some/path', 'some/other/path', 'some/third-file']),
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

    await new Update(
      new Value('some/path'),
      dummyFS,
      context,
      log,
    ).run().execute()

    expect(dummyFS.write).toHaveBeenCalledWith('some/path', 'hellow world, how is {{ _.other }}?')
    expect(log.entries()[0]!.details['target']).toBe('some/path')
    expect(log.entries().length).toBe(1)
  })

  test('can update multiple files using a glob pattern.', async () => {
    const dummyFS: FileSystem = {
      read: jest.fn(async () => 'hellow {{ _.name }}, how is {{ _.other }}?'),
      write: jest.fn(),
      absolute: jest.fn(x => normalize(x)),
      dirname: jest.fn(),
      basename: jest.fn(),
      ls: jest.fn(async () => ['some/path', 'some/other/path', 'some/third-file']),
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

    await new Update(
      new Value('some/*'),
      dummyFS,
      context,
      log,
    ).run().execute()

    expect(dummyFS.write).toHaveBeenCalledWith('some/path', 'hellow world, how is {{ _.other }}?')
    expect(dummyFS.write).toHaveBeenCalledWith('some/third-file', 'hellow world, how is {{ _.other }}?')
    expect(log.entries()[0]!.details['target']).toBe('some/path')
    expect(log.entries()[1]!.details['target']).toBe('some/third-file')
    expect(log.entries().length).toBe(2)
  })

  test('can properly handle relative paths as well.', async () => {
    const files = {
      '/user/some/path': 'hellow {{ _.name }}!',
    }

    const dummyFS: FileSystem = {
      read: jest.fn(async path => files[path]),
      write: jest.fn(async (path, content) => { files[path] = content }),
      absolute: jest.fn(x => normalize(isAbsolute(x) ? x : join('/user', x))),
      dirname: jest.fn(),
      basename: jest.fn(),
      ls: jest.fn(async () => Object.keys(files).map(x => x.slice(6))),
      rm: jest.fn(),
      access: jest.fn(),
      fetch: jest.fn(),
      cd: jest.fn(),
      scope: '/user',
      root: '/user',
    }

    const scope = scopeFromProviders({}, '_', { name: 'world' })
    const context = new EvaluationContext(scope.vars)
    const log = new ChangeLog()

    await new Update(
      new Value('./some/*'),
      dummyFS,
      context,
      log,
    ).run().execute()

    expect(files['/user/some/path']).toBe('hellow world!')
  })
})
