import { cached, isCachedFunction } from '../cached'


describe(cached, () => {
  test('returns a function that is called only once.', async () => {
    const f = jest.fn(async () => 42)
    const cf = cached(f)

    await expect(cf()).resolves.toBe(42)
    await expect(cf()).resolves.toBe(42)
    expect(f).toHaveBeenCalledTimes(1)
  })
})


describe(isCachedFunction, () => {
  test('returns true if the function is a cached function.', () => {
    const f = jest.fn(async () => 42)
    const cf = cached(f)

    expect(isCachedFunction(f)).toBe(false)
    expect(isCachedFunction(cf)).toBe(true)
  })
})
