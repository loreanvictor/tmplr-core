import { FileSystem } from '../../filesystem'
import { Value } from '../../expr/value'
import { EvaluationContext } from '../../eval'
import { scopeFromProviders } from '../../scope'
import { Copy } from '../copy'
import { ChangeLog } from '../change'


describe(Copy, () => {
  test('copies file while evaluating its content.', async () => {
    const dummyFS: FileSystem = {
      read: jest.fn(async () => 'hellow {{ _.name }}, how is {{ _.other }}?'),
      write: jest.fn(),
      absolute: jest.fn(),
      basename: jest.fn(),
      dirname: jest.fn(),
      rm: jest.fn(),
      access: jest.fn(),
      fetch: jest.fn(),
      cd: jest.fn(),
      scope: 'scope',
      root: 'root',
    }

    const scope = scopeFromProviders({}, '_', { name: 'world' })
    const context = new EvaluationContext(scope.vars)
    const log = new ChangeLog()

    await new Copy(
      new Value('some/path'),
      new Value('some/other/path'),
      dummyFS,
      context,
      log,
    ).run().execute()

    expect(dummyFS.write).toHaveBeenCalledWith('some/other/path', 'hellow world, how is {{ _.other }}?')
    expect(log.entries()[0]!.details['source']).toBe('some/path')
    expect(log.entries()[0]!.details['dest']).toBe('some/other/path')
  })
})
