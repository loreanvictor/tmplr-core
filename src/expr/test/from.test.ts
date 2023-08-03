import { providerFromFunctions, sourceFromProviders } from '../../scope'
import { Value } from '../value'
import { From } from '../from'
import { Flow } from '../../flow'


describe(From, () => {
  test('reads given value.', async () => {
    const source = sourceFromProviders({
      stuff: providerFromFunctions({ foo: async () => 'bar' })
    })

    await expect(new From('stuff.foo', source).run(new Flow()).execute()).resolves.toBe('bar')
  })

  test('uses the fallback if the value does not exist.', async () => {
    const source = sourceFromProviders({})
    const from = new From('stuff.foo', source, new Value('bar'))

    await expect(from.run(new Flow()).execute()).resolves.toBe('bar')
  })

  test('resolves to empty string when value not found.', async () => {
    const source = sourceFromProviders({})
    const from = new From('stuff.foo', source)

    await expect(from.run(new Flow()).execute()).resolves.toBe('')
  })
})
