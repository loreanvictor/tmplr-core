import sleep from 'sleep-promise'

import { Flow } from '../../flow'
import { Choices } from '../choices'
import { Value } from '../value'


describe(Choices, () => {
  test('selects a value from given IO interface.', async () => {
    const exec = new Choices(
      new Value('whats up?'),
      [
        { label: new Value('hello'), value: new Value('world') },
        { label: new Value('hi'), value: new Value('there') },
      ],
    ).run(new Flow({ onKill: jest.fn() }))

    const setMessage = jest.fn()
    const setChoices = jest.fn()
    const unplug = jest.fn()

    const res = await Promise.all([
      exec.execute(),
      (
        async () => {
          exec.plug(() => ({
            setMessage,
            setChoices,
            unplug,
            pick: () => new Promise(resolve => {
              setTimeout(() => resolve(1), 5)
            })
          }))
        }
      )()
    ])

    await sleep(10)

    expect(res[0]).toBe('there')
    expect(unplug).toHaveBeenCalled()
    expect(setMessage).toHaveBeenCalledWith('whats up?')
    expect(setChoices).toHaveBeenCalledWith(['hello', 'hi'])
  })
})
