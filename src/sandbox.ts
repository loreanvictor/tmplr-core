import { Subject, combine, pipe, of, prepend, tap, finalize, observe, Source } from 'streamlets'

import { Execution, Stack } from './execution'
import { Runnable } from './runnable'
import { cached, CachedFunction, ProviderNamespace, Scope } from './scope'


export class SandBox extends Execution<void> {
  private forkTracker = new Subject<Stack | undefined>()

  constructor(
    readonly factory: (scope: Scope) => Runnable<void>,
    readonly inputs: {[name: string]: Runnable<string>},
    readonly outputs: {[name: string]: string},
    readonly scope: Scope,
    readonly additionalProviders: ProviderNamespace = {},
  ) { super() }

  async run() {
    const cache: {[name: string]: CachedFunction<string>} = {}

    Object.entries(this.inputs).forEach(([name, input]) => {
      cache[name] = cached(() => this.fork(input.run()))
    })

    const scope = this.scope.sub({
      ...this.additionalProviders,
      args: {
        async has(key: string) { return key in cache },
        get(key: string) { return cache[key]! },
      }
    })


    const runnable = this.factory(scope)
    try {
      await this.delegate(runnable.run())
    } finally {
      await scope.cleanup()
    }

    for (const [name, outname] of Object.entries(this.outputs)) {
      if (await scope.has(outname)) {
        this.scope.set(name, await scope.get(outname))
      } else {
        throw new ReferenceError('Output not found: ' + outname)
      }
    }
  }

  protected async fork(exec: Execution<string>) {
    const observation = pipe(
      exec.tracker,
      tap(stack => this.forkTracker.receive(stack)),
      finalize(() => this.forkTracker.receive(undefined)),
      observe,
    )

    try {
      return await exec.execute()
    } finally {
      observation.stop()
    }
  }

  protected override async delegate<U>(exec: Execution<U>) {
    const fork: Source<Stack | undefined> = pipe(
      this.forkTracker,
      prepend(of(undefined))
    )

    const observation = pipe(
      combine(exec.tracker, fork),
      tap(([mainTrack, forkTrack]) => {
        if (forkTrack === undefined) {
          this.tracker.receive(mainTrack.prepend(this))
        } else {
          this.tracker.receive(new Stack([this, ...mainTrack.stack, ...forkTrack.stack]))
        }
      }),
      observe
    )

    const finalization = pipe(
      exec.tracker,
      finalize(() => this.tracker.receive(new Stack([this]))),
      observe
    )

    try {
      return await exec.execute()
    } finally {
      observation.stop()
      finalization.stop()
    }
  }
}
