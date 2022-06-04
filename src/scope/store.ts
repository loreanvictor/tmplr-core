import { Source, NULL_SOURCE } from './source'


export interface Store extends Source {
  set(variable: string, value: string): Promise<void>
}


export const NULL_STORE: Store = {
  ...NULL_SOURCE,
  set: async () => {
    throw new TypeError('Cannot set values on a null store')
  },
}
