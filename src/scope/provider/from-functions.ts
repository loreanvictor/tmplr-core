import { cached, CachedFunction, isCachedFunction } from './cached'
import { Provider } from './provider'


type MaybeCachedFunction = (() => Promise<string>) | CachedFunction<string>


export function providerFromFunctions(map: {[name: string]: MaybeCachedFunction}): Provider {
  const transformed = { ...map }

  return {
    get(key: string) {
      if (!(key in transformed)) {
        throw new ReferenceError(`Provider does not have key: ${key}`)
      }

      const func = transformed[key]!
      if (!isCachedFunction(func)) {
        transformed[key] = cached(func)

        return transformed[key] as CachedFunction<string>
      } else {
        return func
      }
    },
    has(key: string) {
      return key in transformed
    }
  }
}
