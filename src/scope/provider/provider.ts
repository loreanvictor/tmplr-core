import { CachedFunction } from './cached'


export interface Provider {
  get(key: string): CachedFunction<string>
  has(key: string): boolean
  cleanup?(): Promise<void>
}
