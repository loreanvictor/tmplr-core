import { Subject, replay, pipe, tap, observe, Observation } from 'streamlets'


export class Flow {
  readonly signal = replay(new Subject<boolean>())
  private obs: Observation<unknown> | undefined

  constructor(readonly parent?: Flow) {
    this.signal.receive(false)

    if (parent) {
      this.obs = pipe(
        parent.signal,
        tap((broken) => broken && this.break()),
        observe,
      )
    }
  }

  break(cascade = false) {
    this.signal.receive(true)
    this.obs?.stop()

    if (cascade && this.parent) {
      this.parent.break(true)
    }
  }

  fork() {
    return new Flow(this)
  }

  get broken() {
    return this.signal.last
  }
}
