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
      ls: jest.fn(),
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
    expect(log.entries()[0]!.details['target']).toBe('some/path')
  })
})
