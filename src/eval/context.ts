import { Source } from '../scope/source'
import { PipeRegistry, PipeMap } from './pipe'


export class EvaluationContext {
  readonly pipes: PipeRegistry

  constructor(
    readonly source: Source,
    pipes: PipeRegistry | PipeMap = new PipeRegistry(),
  ) {
    if (pipes instanceof PipeRegistry) {
      this.pipes = pipes
    } else {
      this.pipes = new PipeRegistry(pipes)
    }
  }

  async evaluate(expr: string) {
    const RE = /{{(\s*[A-Za-z]\w*(?:\.[A-Za-z]\w*)?(?:\s*\|\s*[^:]+(?::[^:]+)?\s*)*\s*)}}/g

    return (
      await Promise.all(
        expr.split(RE).map(async (piece, i) => {
          if (i % 2 === 0) {
            return piece
          }

          const [addr, ...pipes] = piece.split('|').map(_ => _.trim())

          if (this.source.has(addr!)) {
            try {
              return pipes
                .map(e => this.pipes.evaluate(e))
                .reduce(
                  (res, pipe) => pipe(res),
                  await this.source.get(addr!)
                )
            } catch {
              return `{{${piece}}}`
            }
          } else {
            return `{{${piece}}}`
          }
        })
      )
    ).join('')
  }
}
