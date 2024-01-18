import { Subject, replay, pipe, tap, observe, Observation } from 'streamlets'


export interface FlowEnv {
  onKill(handler: () => Promise<void>): () => void
}


export class Flow {
  readonly signal = replay(new Subject<boolean>())
  private obs: Observation<unknown> | undefined
  readonly parent: Flow | undefined
  readonly env: FlowEnv

  constructor(parent: Flow);
  constructor(env: FlowEnv)
  constructor(parentOrFlow: Flow | FlowEnv) {
    this.signal.receive(false)

    if (parentOrFlow instanceof Flow) {
      this.parent = parentOrFlow
      this.env = this.parent.env
      this.obs = pipe(
        this.parent.signal,
        tap((broken) => broken && this.break()),
        observe,
      )
    } else {
      this.env = parentOrFlow
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

  onKill(handler: () => Promise<void>) {
    return this.env.onKill(handler)
  }
}
