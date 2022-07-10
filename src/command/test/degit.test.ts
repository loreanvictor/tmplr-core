import { FileSystem } from '../../filesystem'
import { Value } from '../../expr/value'
import { Degit } from '../degit'
import { ChangeLog } from '../change'


describe(Degit, () => {
  test('clones remote into given folder.', async () => {
    const dummyFS: FileSystem = {
      read: jest.fn(),
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

    const log = new ChangeLog()

    await new Degit(
      new Value('some:repo'),
      new Value('some/path'),
      dummyFS,
      log,
    ).run().execute()

    expect(dummyFS.fetch).toHaveBeenCalledWith('some:repo', 'some/path')
    expect(log.entries()[0]!.details['source']).toBe('some:repo')
    expect(log.entries()[0]!.details['target']).toBe('some/path')
  })
})
