import { Flow } from '../../flow'
import { Noop } from '../noop'


describe(Noop, () => {
  test('it runs.', async () => {
    const noop = new Noop()
    const flow = new Flow({ onKill: jest.fn() })
    const execution = noop.run(flow).execute()

    await expect(execution).resolves.toBeUndefined()
  })
})
