import { Execution } from './execution'
import { Flow } from './flow'


export abstract class Runnable<T> {
  abstract run(flow: Flow): Execution<T>
}
