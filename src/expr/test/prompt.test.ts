import { Prompt } from '../prompt'
import { Value } from '../value'


describe('Prompt', () => {
  test('reads a value from given IO interface.', async () => {
    jest.useFakeTimers()

    const exec = new Prompt('What is the value?').run()

    let msg = ''
    let def = ''
    let unplugged = false

    const res = await Promise.all([
      exec.execute(),
      (
        async () => {
          exec.plug(() => ({
            setMessage: m => msg = m,
            setDefault: d => def = d,
            onValue: cb => {
              setTimeout(() => cb('Some value'), 100)
              jest.advanceTimersByTime(100)
            },
            unplug: () => unplugged = true,
          }))
        }
      )()
    ])

    expect(msg).toBe('What is the value?')
    expect(def).toBe('')
    expect(res).toEqual(['Some value', undefined])
    expect(unplugged).toBe(true)

    jest.useRealTimers()
  })


  test('evaluates default values.', async () => {
    const exec = new Prompt(
      'What is the value?',
      new Value('Some default value'),
    ).run()

    let def = ''

    await Promise.all([
      exec.execute(),
      (
        async () => {
          exec.plug(() => ({
            setDefault: d => def = d,
            onValue: cb => cb('42'),
            setMessage: () => {},
            unplug: () => {}
          }))
        }
      )()
    ])

    expect(def).toBe('Some default value')
  })
})
