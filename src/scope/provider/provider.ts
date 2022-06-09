import { CachedFunction } from './cached'


export interface Provider {
  get(key: string): CachedFunction<string>
  has(key: string): Promise<boolean>
}


export interface CleanableProvider extends Provider {
  cleanup(): Promise<void>
  isolate(): CleanableProvider
}


export function isCleanable(provider: Provider | CleanableProvider): provider is CleanableProvider {
  return (provider as any).cleanup !== undefined && (provider as any).isolate !== undefined
}
