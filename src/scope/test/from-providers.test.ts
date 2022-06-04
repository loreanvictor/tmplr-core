import { Provider, providerFromFunctions } from '../provider'
import { scopeFromProviders, sourceFromProviders, storeFromProviders } from '../from-providers'


describe(sourceFromProviders, () => {
  test('creates a source.', async () => {
    const cleanable: Provider = {
      get: jest.fn(),
      has: jest.fn(),
      cleanup: jest.fn()
    }

    const provider = providerFromFunctions({
      foo: async () => 'bar',
      baz: async () => 'qux',
    })

    const source = sourceFromProviders({
      stuff: provider,
      cleanable,
    }, { 'var' : 'value' })

    await expect(source.get('stuff.foo')).resolves.toBe('bar')
    await expect(source.get('stuff.baz')).resolves.toBe('qux')
    await expect(source.get('var')).resolves.toBe('value')

    await expect(async () => source.get('stuff.qux')).rejects.toThrow(ReferenceError)
    await expect(async () => source.get('foo')).rejects.toThrow(ReferenceError)
    await expect(async () => source.get('things.foo')).rejects.toThrow(ReferenceError)

    expect(source.has('stuff.foo')).toBe(true)
    expect(source.has('stuff.baz')).toBe(true)
    expect(source.has('var')).toBe(true)
    expect(source.has('stuff.qux')).toBe(false)
    expect(source.has('things.foo')).toBe(false)
    expect(source.has('foo')).toBe(false)

    await source.cleanup()
    expect(cleanable.cleanup).toHaveBeenCalled()
  })

  test('can create without a var bag too.', () => {
    const source = sourceFromProviders({})

    expect(source.has('foo')).toBe(false)
  })
})


describe(storeFromProviders, () => {
  test('creates a store.', async () => {
    const store = storeFromProviders({})

    expect(store.has('foo')).toBe(false)
    store.set('foo', 'bar')
    expect(store.has('foo')).toBe(true)
    await expect(store.get('foo')).resolves.toBe('bar')
  })
})


describe(scopeFromProviders, () => {
  test('creates a scope.', async () => {
    const provider = providerFromFunctions({
      foo: async () => 'bar',
      baz: async () => 'qux',
    })

    const scope = scopeFromProviders({ stuff: provider }, 'tmplr', { var : 'value' })

    await expect(scope.get('stuff.foo')).resolves.toBe('bar')
    await expect(scope.get('stuff.baz')).resolves.toBe('qux')
    await expect(scope.get('var')).resolves.toBe('value')
    await expect(scope.vars.get('tmplr.var')).resolves.toBe('value')

    expect(scope.has('stuff.foo')).toBe(true)
    expect(scope.has('stuff.baz')).toBe(true)
    expect(scope.has('var')).toBe(true)
    expect(scope.vars.has('tmplr.var')).toBe(true)

    expect(scope.has('stuff.qux')).toBe(false)
    expect(scope.has('things.foo')).toBe(false)
    expect(scope.has('stuff.var')).toBe(false)
    expect(scope.vars.has('var')).toBe(false)

    const things = providerFromFunctions({
      foo: async () => 'baz',
    })

    await scope.set('john', 'doe')

    const sub = scope.sub({ things })

    expect(sub.has('stuff.foo')).toBe(true)
    expect(sub.has('things.foo')).toBe(true)

    expect(sub.vars.has('tmplr.john')).toBe(true)
    expect(sub.vars.has('tmplr.var')).toBe(true)

    await expect(sub.get('things.foo')).resolves.toBe('baz')
    await expect(sub.get('stuff.foo')).resolves.toBe('bar')
    await expect(sub.get('john')).resolves.toBe('doe')
    await expect(sub.get('var')).resolves.toBe('value')
    await expect(sub.vars.get('tmplr.var')).resolves.toBe('value')
    await expect(sub.vars.get('tmplr.john')).resolves.toBe('doe')

    await expect(async () => sub.get('stuff.qux')).rejects.toThrow(ReferenceError)

    await scope.set('john', 'cash')
    await scope.set('bla', 'bla')

    await expect(scope.get('john')).resolves.toBe('cash')
    await expect(sub.get('john')).resolves.toBe('doe')
    expect(sub.has('bla')).toBe(false)
    expect(sub.vars.has('tmplr.bla')).toBe(false)

    await expect(async () => sub.vars.get('tmplr.bla')).rejects.toThrow(ReferenceError)
  })

  test('can create without a var bag too.', () => {
    const scope = scopeFromProviders({}, 'vars')

    expect(scope.has('foo')).toBe(false)
  })
})


