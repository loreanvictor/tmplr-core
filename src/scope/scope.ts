import { Provider } from './provider'
import { Source, NULL_SOURCE } from './source'
import { NULL_STORE } from './store'


export interface Scope {
  vars: Source,
  sub: (_: {[namespace: string]: Provider}) => Scope,
}


export const NULL_SCOPE: Scope = {
  ...NULL_STORE,
  vars: NULL_SOURCE,
  sub: () => NULL_SCOPE,
}
