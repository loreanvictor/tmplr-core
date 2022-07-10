import { providerFromFunctions } from '../scope'
import { FileSystem } from './types'


export const filesystemProvider = (fs: FileSystem) => providerFromFunctions({
  root: async () => fs.root,
  scope: async () => fs.scope,
  rootdir: async () => fs.basename(fs.root),
  scopedir: async () => fs.basename(fs.scope),
})
