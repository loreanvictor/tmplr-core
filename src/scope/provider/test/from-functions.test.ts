import { providerFromFunctions } from '../from-functions'
import { cached } from '../cached'


describe('providerFromFunctions()', () => {
  test('creates a provider from given functions.', async () => {
    const bar = jest.fn(async () => 'World')

    const provider = providerFromFunctions({
      foo: cached(async () => 'Hellow'),
      bar,
    })

    expect(provider.has('foo')).toBe(true)
    expect(provider.has('bar')).toBe(true)
    expect(provider.has('baz')).toBe(false)

    await expect(provider.get('foo')()).resolves.toBe('Hellow')
    await expect(provider.get('bar')()).resolves.toBe('World')
    await expect(provider.get('bar')()).resolves.toBe('World')
    await expect(async () => provider.get('baz')).rejects.toThrow(ReferenceError)

    expect(bar).toHaveBeenCalledTimes(1)
  })
})
