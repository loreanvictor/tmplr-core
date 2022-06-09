import { CleanableProvider, providerFromFunctions } from '../provider'
import { scopeFromProviders, sourceFromProviders, storeFromProviders } from '../from-providers'


describe(sourceFromProviders, () => {
  test('creates a source.', async () => {
    const cleanable: CleanableProvider = {
      get: jest.fn(),
      has: jest.fn(),
      cleanup: jest.fn(),
      isolate: jest.fn(),
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

    await expect(source.has('stuff.foo')).resolves.toBe(true)
    await expect(source.has('stuff.baz')).resolves.toBe(true)
    await expect(source.has('var')).resolves.toBe(true)
    await expect(source.has('stuff.qux')).resolves.toBe(false)
    await expect(source.has('things.foo')).resolves.toBe(false)
    await expect(source.has('foo')).resolves.toBe(false)

    await source.cleanup()
    expect(cleanable.cleanup).toHaveBeenCalled()
  })

  test('can create without a var bag too.', async () => {
    const source = sourceFromProviders({})

    await expect(source.has('foo')).resolves.toBe(false)
  })
})


describe(storeFromProviders, () => {
  test('creates a store.', async () => {
    const store = storeFromProviders({})

    await expect(store.has('foo')).resolves.toBe(false)
    store.set('foo', 'bar')
    await expect(store.has('foo')).resolves.toBe(true)
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

    await expect(scope.has('stuff.foo')).resolves.toBe(true)
    await expect(scope.has('stuff.baz')).resolves.toBe(true)
    await expect(scope.has('var')).resolves.toBe(true)
    await expect(scope.vars.has('tmplr.var')).resolves.toBe(true)

    await expect(scope.has('stuff.qux')).resolves.toBe(false)
    await expect(scope.has('things.foo')).resolves.toBe(false)
    await expect(scope.has('stuff.var')).resolves.toBe(false)
    await expect(scope.vars.has('var')).resolves.toBe(false)

    const things = providerFromFunctions({
      foo: async () => 'baz',
    })

    await scope.set('john', 'doe')

    const sub = scope.sub({ things })

    await expect(sub.has('stuff.foo')).resolves.toBe(true)
    await expect(sub.has('things.foo')).resolves.toBe(true)

    await expect(sub.vars.has('tmplr.john')).resolves.toBe(false)
    await expect(sub.vars.has('tmplr.var')).resolves.toBe(true)

    await expect(sub.get('things.foo')).resolves.toBe('baz')
    await expect(sub.get('stuff.foo')).resolves.toBe('bar')
    await expect(sub.get('var')).resolves.toBe('value')
    await expect(sub.vars.get('tmplr.var')).resolves.toBe('value')

    await expect(async () => sub.get('stuff.qux')).rejects.toThrow(ReferenceError)

    await scope.set('john', 'cash')
    await scope.set('bla', 'bla')

    await expect(scope.get('john')).resolves.toBe('cash')
    await expect(sub.has('bla')).resolves.toBe(false)
    await expect(sub.vars.has('tmplr.bla')).resolves.toBe(false)

    await expect(async () => sub.vars.get('tmplr.bla')).rejects.toThrow(ReferenceError)
  })

  test('can create without a var bag too.', async () => {
    const scope = scopeFromProviders({}, 'vars')

    await expect(scope.has('foo')).resolves.toBe(false)
  })

  test('isolates cleanable providers for subscopes.', async () => {
    const isolatedCleanup = jest.fn()
    const cleanable: CleanableProvider = {
      ...providerFromFunctions({
        foo: async () => 'bar',
      }),
      cleanup: jest.fn(),
      isolate: () => ({ ...cleanable, cleanup: isolatedCleanup }),
    }

    const scope = scopeFromProviders({ cleanable }, '_')
    const sub = scope.sub({})

    await expect(sub.get('cleanable.foo')).resolves.toBe('bar')
    await sub.cleanup()
    expect(isolatedCleanup).toHaveBeenCalled()
    expect(cleanable.cleanup).not.toHaveBeenCalled()
  })
})


