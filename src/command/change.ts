import { Execution } from '../execution'
import { FileSystem } from '../filesystem'


export interface ChangeDetails {
  [key: string]: string
}


export interface ChangeLogEntry {
  change: ChangeExecution,
  details: ChangeDetails,
}


export class ChangeLog {
  private history: ChangeLogEntry[] = []

  public entries(): ChangeLogEntry[] {
    return this.history
  }

  public commit(entry: ChangeLogEntry) {
    this.history.push(entry)
  }
}


export abstract class ChangeExecution extends Execution<void> {
  constructor(
    readonly filesystem: FileSystem,
    readonly log?: ChangeLog,
  ) { super() }

  async run() {
    const details = await this.commit()
    if (this.log) {
      this.log.commit({
        change: this,
        details,
      })
    }
  }

  protected abstract commit(): Promise<ChangeDetails>
}
