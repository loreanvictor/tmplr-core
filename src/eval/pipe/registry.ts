import { Pipe, PipeMap } from './pipe'


export class PipeRegistry {
  constructor(
    private pipes: PipeMap = {},
  ) { }

  evaluate(expr: string) {
    const [_name, ..._param] = expr.split(':')
    const name = _name?.trim()
    const param = _param.join(':').trim()

    if (!(name! in this.pipes)) {
      throw new Error('Invalid pipe: ' + name)
    } else {
      return (s: string) => (this.pipes[name!] as any)(s, param)
    }
  }

  add(name: string, pipe: Pipe) {
    this.pipes[name] = pipe
  }
}
