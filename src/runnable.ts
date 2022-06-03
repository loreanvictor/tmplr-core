import { Execution } from './execution'


export abstract class Runnable<T> {
  abstract run(): Execution<T>
}
