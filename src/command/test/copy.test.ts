import { FileSystem } from '../../filesystem'
import { Value } from '../../expr/value'
import { EvaluationContext } from '../../eval'
import { scopeFromProviders } from '../../scope'
import { Copy } from '../copy'


describe(Copy, () => {
  test('copies file while evaluating its content.', async () => {
    const dummyFS: FileSystem = {
      read: jest.fn(async () => 'hellow {{ _.name }}, how is {{ _.other }}?'),
      write: jest.fn(),
      absolute: jest.fn(),
      rm: jest.fn(),
      access: jest.fn(),
      fetch: jest.fn(),
      cd: jest.fn(),
      scope: 'scope',
      root: 'root',
    }

    const scope = scopeFromProviders({}, '_', { name: 'world' })
    const context = new EvaluationContext(scope.vars)

    await new Copy(
      new Value('some/path'),
      new Value('some/other/path'),
      dummyFS,
      context,
    ).run().execute()

    expect(dummyFS.write).toHaveBeenCalledWith('some/other/path', 'hellow world, how is {{ _.other }}?')
  })
})
