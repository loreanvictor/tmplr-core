import { pipe, Subject, map, tap, observe, finalize, Observation } from 'streamlets'
import { Flow } from './flow'


export class Stack {
  constructor(readonly stack: Execution<unknown>[]) {}

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
    protected flow: Flow
  ) { }

  protected abstract run(): Promise<T>

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

  public trace() {
    const res = {} as any

    res.stacks = <Stack[]>[]
    res.finalized = false
    res.observation = pipe(
      this.tracker,
      tap(stack => res.stacks.push(stack)),
      finalize(() => res.finalized = true),
      observe,
    )

    res.result = this.execute()

    return res as {
      stacks: Stack[]
      finalized: boolean
      observation: Observation<Stack>,
      result: Promise<T>,
    }
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
