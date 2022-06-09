import { providerFromFunctions } from '../from-functions'
import { cached } from '../cached'


describe('providerFromFunctions()', () => {
  test('creates a provider from given functions.', async () => {
    const bar = jest.fn(async () => 'World')

    const provider = providerFromFunctions({
      foo: cached(async () => 'Hellow'),
      bar,
    })

    await expect(provider.has('foo')).resolves.toBe(true)
    await expect(provider.has('bar')).resolves.toBe(true)
    await expect(provider.has('baz')).resolves.toBe(false)

    await expect(provider.get('foo')()).resolves.toBe('Hellow')
    await expect(provider.get('bar')()).resolves.toBe('World')
    await expect(provider.get('bar')()).resolves.toBe('World')
    await expect(async () => provider.get('baz')).rejects.toThrow(ReferenceError)

    expect(bar).toHaveBeenCalledTimes(1)
  })
})
