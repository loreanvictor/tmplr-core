export interface Source {
  get(key: string): Promise<string>
  has(key: string): Promise<boolean>
  cleanup(): Promise<void>
}


export const NULL_SOURCE: Source = {
  get: async () => { throw new ReferenceError('Cannot get values on a null source') },
  has: async () => false,
  cleanup: async () => {},
}
