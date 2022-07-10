import { basename, dirname } from 'path'

import { ChangeLog, ChangeExecution } from '../change'
import { FileSystem } from '../../filesystem'


describe(ChangeExecution, () => {
  test('commits logs of changes to given change log', async () => {
    const log = new ChangeLog()
    const dummyFS: FileSystem = {
      read: jest.fn(() => Promise.resolve('content')),
      write: jest.fn(() => Promise.resolve()),
      access: jest.fn(() => Promise.resolve()),
      rm: jest.fn(() => Promise.resolve()),
      scope: 'scope',
      root: 'root',
      absolute: jest.fn(() => 'absolute'),
      basename: jest.fn(path => basename(path)),
      dirname: jest.fn(path => dirname(path)),
      cd: jest.fn(() => dummyFS),
      fetch: jest.fn(() => Promise.resolve()),
    }

    class DummyChangeExec extends ChangeExecution {
      constructor() {
        super(dummyFS, log)
      }

      async commit() {
        return {
          foo: 'bar',
        }
      }
    }

    const exec = new DummyChangeExec()
    await exec.execute()

    expect(log.entries()).toHaveLength(1)
    expect(log.entries()[0]!.change).toBe(exec)
    expect(log.entries()[0]!.details).toEqual({
      foo: 'bar',
    })
  })
})
