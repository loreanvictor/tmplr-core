import { Flow } from '../../flow'
import { Prompt } from '../prompt'
import { Value } from '../value'


describe(Prompt, () => {
  test('reads a value from given IO interface.', async () => {
    jest.useFakeTimers()

    const exec = new Prompt(new Value('What is the value?')).run(new Flow())

    const setMessage = jest.fn()
    const setDefault = jest.fn()
    const unplug = jest.fn()

    const res = await Promise.all([
      exec.execute(),
      (
        async () => {
          exec.plug(() => ({
            setMessage,
            setDefault,
            value: () => new Promise<string>(resolve => {
              setTimeout(() => resolve('Some value'), 100)
              jest.advanceTimersByTime(100)
            }),
            unplug,
          }))
        }
      )()
    ])

    expect(setMessage).toHaveBeenCalledWith('What is the value?')
    expect(setDefault).not.toHaveBeenCalled()
    expect(res).toEqual(['Some value', undefined])
    expect(unplug).toHaveBeenCalled()

    jest.useRealTimers()
  })


  test('evaluates default values.', async () => {
    const exec = new Prompt(
      new Value('What is the value?'),
      { default: new Value('Some default value') },
    ).run(new Flow())

    const setDefault = jest.fn()

    await Promise.all([
      exec.execute(),
      (
        async () => {
          exec.plug(() => ({
            setDefault,
            value: async () => '42',
            setMessage: () => {},
            unplug: () => {}
          }))
        }
      )()
    ])

    expect(setDefault).toHaveBeenCalledWith('Some default value')
  })
})
