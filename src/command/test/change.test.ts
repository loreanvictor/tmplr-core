import { ChangeLog, ChangeExecution } from '../change'
import { NodeFS } from '../../filesystem'


describe(ChangeExecution, () => {
  test('commits logs of changes to given change log', async () => {
    const log = new ChangeLog()

    class DummyChangeExec extends ChangeExecution {
      constructor() {
        super(new NodeFS(), log)
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
