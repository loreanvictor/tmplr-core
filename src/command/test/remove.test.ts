import { FileSystem } from '../../filesystem'
import { Value } from '../../expr/value'
import { Remove } from '../remove'


describe(Remove, () => {
  test('removes file.', async () => {
    const dummyFS: FileSystem = {
      read: jest.fn(),
      write: jest.fn(),
      absolute: jest.fn(),
      rm: jest.fn(),
      access: jest.fn(),
      fetch: jest.fn(),
      cd: jest.fn(),
      scope: 'scope',
      root: 'root',
    }

    await new Remove(
      new Value('some/path'),
      dummyFS,
    ).run().execute()

    expect(dummyFS.rm).toHaveBeenCalledWith('some/path')
  })
})
