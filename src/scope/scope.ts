import { Provider } from './provider'
import { Source, NULL_SOURCE } from './source'
import { NULL_STORE, Store } from './store'


export type ProviderNamespace = {[namespace: string]: Provider}


export interface Scope extends Store {
  vars: Source,
  sub: (_: ProviderNamespace) => Scope,
}


export const NULL_SCOPE: Scope = {
  ...NULL_STORE,
  vars: NULL_SOURCE,
  sub: () => NULL_SCOPE,
}
