import { FileSystem } from '../../filesystem'
import { Value } from '../../expr/value'
import { Degit } from '../degit'


describe(Degit, () => {
  test('clones remote into given folder.', async () => {
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

    await new Degit(
      new Value('some:repo'),
      new Value('some/path'),
      dummyFS,
    ).run().execute()

    expect(dummyFS.fetch).toHaveBeenCalledWith('some:repo', 'some/path')
  })
})
