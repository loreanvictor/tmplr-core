export type CachedFunction<T> = {
  (): Promise<T>
  __cache?: T
  __cached: boolean
  __cachedFunc: true
}


export function cached<T>(fn: () => Promise<T>) {
  const _cached: CachedFunction<T> = (async() => {
    if (!_cached.__cached) {
      _cached.__cache = await fn()
      _cached.__cached = true
    }

    return _cached.__cache!
  }) as any
  _cached.__cached = false
  _cached.__cachedFunc = true

  return _cached
}


export function isCachedFunction<T>(fn: (() => Promise<T>) | CachedFunction<T>): fn is CachedFunction<T> {
  return (fn as any).__cachedFunc || false
}
