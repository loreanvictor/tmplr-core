import { Deferred } from './deferred'
import { Execution } from './runnable'


export interface Unpluggable {
  unplug()
}


export type IOConnector<IO extends Unpluggable> = () => IO


export abstract class IOExecution<T, IO extends Unpluggable> extends Execution<T> {
  private connector = new Deferred<IOConnector<IO>>()

  async connect() {
    return (await this.connector.promise)()
  }

  plug(connector: IOConnector<IO>) {
    this.connector.resolve(connector)
  }

  unplug() {
    this.connector = new Deferred<IOConnector<IO>>()
  }
}
