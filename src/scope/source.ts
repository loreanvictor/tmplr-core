export interface Source {
  get(key: string): Promise<string>
  has(key: string): boolean
  cleanup(): Promise<void>
}


export const NULL_SOURCE: Source = {
  get: async () => { throw new Error('Cannot get values on a null store') },
  has: () => false,
  cleanup: async () => {},
}
