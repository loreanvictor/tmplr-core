import { Deferred } from '../deferred'


describe('Deferred', () => {
  test('allows manually resolving a value later.', async () => {
    const deferred = new Deferred<number>()

    const value = await Promise.all([
      (async () => {
        return await deferred.promise * 2
      })(),
      (async () => deferred.resolve(21))(),
    ])

    expect(value).toEqual([42, undefined])
  })


  test('deferred promises can also be rejected.', async () => {
    const deferred = new Deferred()

    await expect((async () => {
      await Promise.all([
        (async () => {
          try {
            await deferred.promise
          } catch {
            throw new Error('Alice')
          }
        })(),
        (async () => deferred.reject(new Error('Bob')))()
      ])
    })()).rejects.toThrow('Alice')
  })
})
