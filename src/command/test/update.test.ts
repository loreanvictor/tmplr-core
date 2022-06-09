import { FileSystem } from '../../filesystem'
import { Value } from '../../expr/value'
import { EvaluationContext } from '../../eval'
import { scopeFromProviders } from '../../scope'
import { Update } from '../update'


describe(Update, () => {
  test('updates file, evaluating its content.', async () => {
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

    await new Update(
      new Value('some/path'),
      dummyFS,
      context,
    ).run().execute()

    expect(dummyFS.write).toHaveBeenCalledWith('some/path', 'hellow world, how is {{ _.other }}?')
  })
})