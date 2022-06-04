export interface Source {
  get(key: string): Promise<string>
  has(key: string): boolean
  cleanup(): Promise<void>
}


export const NULL_SOURCE: Source = {
  get: async () => { throw new ReferenceError('Cannot get values on a null source') },
  has: () => false,
  cleanup: async () => {},
}
