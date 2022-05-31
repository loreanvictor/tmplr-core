import { Provider } from './provider'
import { Source } from './source'
import { Store } from './store'
import { Scope } from './scope'


type ProviderNamespace = {[namespace: string]: Provider}
type VarBag = {[key: string]: string}


export function sourceFromProviders(
  providers: ProviderNamespace,
  vars:VarBag = {}
): Source {
  return {
    async get(addr: string) {
      const [namespace, key] = addr.split('.')

      if (!key) {
        if (namespace! in vars) {
          return vars[namespace!]!
        }

        throw new Error(`Unknown variable: ${addr}`)
      } else {
        if (namespace! in providers) {
          const provider = providers[namespace!]
          if (!provider!.has(key)) {
            throw new Error(`Provider ${namespace} does not have a key ${key}`)
          }

          return await provider!.get(key)()
        }

        throw new Error(`Unknown provider: ${namespace}`)
      }
    },

    has(addr: string) {
      const [namespace, key] = addr.split('.')

      if (!key) {
        return namespace! in vars
      } else {
        return namespace! in providers && providers[namespace!]!.has(key)
      }
    },

    async cleanup() {
      for (const provider of Object.values(providers)) {
        if (provider!.cleanup) {
          await provider!.cleanup()
        }
      }
    }
  }
}


export function storeFromProviders(
  providers: ProviderNamespace,
  vars: VarBag = {},
): Store {
  return {
    ...sourceFromProviders(providers, vars),
    async set(variable: string, value: string) {
      vars[variable] = value
    }
  }
}


function createVarSource(store: Store, prefix: string): Source {
  const pre = prefix + '.'

  return {
    has(key: string) {
      return key.startsWith(pre) && store.has(key.slice(pre.length))
    },
    async get(key: string) {
      return await store.get(key.slice(pre.length))
    },
    async cleanup() { }
  }
}


export function scopeFromProviders(
  providers: ProviderNamespace,
  variablePrefix: string,
  vars: VarBag = {},
): Scope {
  const store = storeFromProviders(providers, vars)
  const _vars = createVarSource(store, variablePrefix)
  const snapshot = { ...vars }

  const sub = (additionalProviders: ProviderNamespace = {}) => {
    return scopeFromProviders({ ...providers, ...additionalProviders }, variablePrefix, { ...snapshot })
  }

  return {
    ...store,
    vars: _vars,
    sub,
  }
}
