import { Source } from '../scope/source'
import { EvaluationContext } from './context'
import { STANDARD_PIPES } from './pipe'


export function createStandardContext(source: Source) {
  return new EvaluationContext(source, STANDARD_PIPES)
}
