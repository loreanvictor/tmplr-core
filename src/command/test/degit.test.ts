import { FileSystem } from '../../filesystem'
import { Value } from '../../expr/value'
import { Degit } from '../degit'
import { ChangeLog } from '../change'
import { Flow } from '../../flow'


describe(Degit, () => {
  test('clones remote into given folder.', async () => {
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

    await new Degit(
      new Value('some:repo'),
      new Value('some/path'),
      dummyFS,
      { log }
    ).run(new Flow({ onKill: jest.fn() })).execute()

    expect(dummyFS.fetch).toHaveBeenCalledWith('some:repo', 'some/path', { subgroup: undefined })
    expect(log.entries()[0]!.details['source']).toBe('some:repo')
    expect(log.entries()[0]!.details['target']).toBe('some/path')
  })

  test('can be called without any extras.', async () => {
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

    await new Degit(
      new Value('some:repo'),
      new Value('some/path'),
      dummyFS,
    ).run(new Flow({ onKill: jest.fn() })).execute()

    expect(dummyFS.fetch).toHaveBeenCalledWith('some:repo', 'some/path', { subgroup: undefined })
  })

  test('supports subgroup option.', async () => {
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

    await new Degit(
      new Value('some:repo/group'),
      new Value('some/path'),
      dummyFS,
      { log, subgroup: true }
    ).run(new Flow({ onKill: jest.fn() })).execute()

    expect(dummyFS.fetch).toHaveBeenCalledWith('some:repo/group', 'some/path', { subgroup: true })
    expect(log.entries()[0]!.details['source']).toBe('some:repo/group')
    expect(log.entries()[0]!.details['target']).toBe('some/path')
  })

})
