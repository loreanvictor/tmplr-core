import { pipe, Subject, map, tap, observe, finalize } from 'streamlets'


export class Stack {
  constructor(private stack: Execution<unknown>[] = []) {}

  prepend(execution: Execution<unknown>) {
    return new Stack([execution, ...this.stack])
  }

  peek() {
    return this.stack[this.stack.length - 1]
  }

  parent() {
    return this.stack[this.stack.length - 2]
  }
}


export abstract class Execution<T> {
  readonly tracker = new Subject<Stack>()

  constructor(
  ) { }

  abstract run(): Promise<T>

  protected start() {
    this.tracker.receive(new Stack([this]))
  }

  protected end() {
    this.tracker.end()
  }

  public async execute(): Promise<T> {
    this.start()
    const result = await this.run()
    this.end()

    return result
  }

  protected async delegate<U>(exec: Execution<U>) {
    const observation = pipe(
      exec.tracker,
      map(stack => stack.prepend(this)),
      tap(stack => this.tracker.receive(stack)),
      finalize(() => this.tracker.receive(new Stack([this]))),
      observe,
    )

    try {
      return await exec.execute()
    } finally {
      observation.stop()
    }
  }
}


export abstract class Runnable<T> {
  abstract run(): Execution<T>
}
