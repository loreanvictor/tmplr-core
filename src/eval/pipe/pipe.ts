export type Pipe = ((value: string) => string)
  | ((value: string, param: string) => string)
  | ((value: string, param: number) => string)
  | ((value: string, param: string | number) => string)

export type PipeMap = {[name: string]: Pipe}
