export interface FileSystem {
  read(path: string): Promise<string>
  write(path: string, content: string): Promise<void>
  access(path: string): Promise<void>
  rm(path: string): Promise<void>

  scope: string
  root: string
  absolute(path: string): string
  cd(path: string): FileSystem
}


export class AccessError extends Error {
  constructor(path: string, scope: string) {
    super(`Access error: ${path} is not within eligible scope ${scope}`)
  }
}
