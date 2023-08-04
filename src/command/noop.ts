import { Execution } from '../execution'
import { Flow } from '../flow'
import { Runnable } from '../runnable'


export class NoopExecution extends Execution<void> {
  protected override async run() {
  }
}


export class Noop extends Runnable<void> {
  run(flow: Flow) { return new NoopExecution(flow) }
}
