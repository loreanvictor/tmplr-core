import { normalize } from 'path/posix'

import { FileSystem } from '../../filesystem'
import { Value } from '../../expr/value'
import { EvaluationContext } from '../../eval'
import { scopeFromProviders } from '../../scope'
import { Write } from '../write'
import { ChangeLog } from '../change'
import { Flow } from '../../flow'


describe(Write, () => {
  test('write to file evaluating given content.', async () => {
    const dummyFS: FileSystem = {
      read: jest.fn(),
      write: jest.fn(),
      ls: jest.fn(),
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

    await new Write(
      new Value('hellow {{ _.name }}, how is {{ _.other }}?'),
      new Value('some/path'),
      dummyFS,
      context
    ).run(new Flow({ onKill: jest.fn() })).execute()

    expect(dummyFS.write).toHaveBeenCalledWith('some/path', 'hellow world, how is {{ _.other }}?')
    // expect(log.entries()[0]!.details['target']).toBe('some/path')
    // expect(log.entries()[0]!.details['content']).toBe('hellow world, how is {{ _.other }}?')
  })

  test('adds log entry', async () => {
    const dummyFS: FileSystem = {
      read: jest.fn(),
      write: jest.fn(),
      ls: jest.fn(),
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

    await new Write(
      new Value('hellow {{ _.name }}, how is {{ _.other }}?'),
      new Value('some/path'),
      dummyFS,
      context,
      { log }
    ).run(new Flow({ onKill: jest.fn() })).execute()

    expect(log.entries()[0]!.details['target']).toBe('some/path')
    expect(log.entries()[0]!.details['content']).toBe('hellow world, how is {{ _.other }}?')
  })
})
