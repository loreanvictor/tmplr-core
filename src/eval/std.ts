import { Source } from '../scope/source'
import { EvaluationContext } from './context'
import { StandardPipes } from './pipe'


export function createStandardContext(source: Source) {
  return new EvaluationContext(source, StandardPipes)
}
