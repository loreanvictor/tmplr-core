import { pipe, observe, tap, finalize } from 'streamlets'

import { Execution, Stack } from '../execution'


class ExA extends Execution<number> {
  async run() { return 21 }
}

class ExB extends Execution<void> {
  async run() { }
}

class ExC extends Execution<number> {
  async run() {
    const res = await this.delegate(new ExA())
    await this.delegate(new ExB())

    return res * 3
  }
}

class ExD extends Execution<boolean> {
  async run() {
    const a = await this.delegate(new ExC())
    const b = await this.delegate(new ExA())

    return a - b === 42
  }
}


describe('Execution', () => {
  test('executes properly.', async () => {
    const exec = new ExD()
    const result = await exec.execute()

    expect(result).toBe(true)
  })


  test('emits proper execution stack.', async () => {
    const exec = new ExD()
    const tracked: Stack[] = []
    let finalized = false

    pipe(
      exec.tracker,
      tap(stack => tracked.push(stack)),
      finalize(() => finalized = true),
      observe,
    )

    await exec.execute()

    expect(tracked.length).toBe(9)
    expect(tracked[0]!.peek()).toBe(exec)

    expect(tracked[1]!.peek()).toBeInstanceOf(ExC)
    expect(tracked[1]!.parent()).toBe(exec)
    const exC = tracked[1]!.peek() as ExC

    expect(tracked[2]!.peek()).toBeInstanceOf(ExA)
    expect(tracked[2]!.parent()).toBe(exC)

    expect(tracked[3]!.peek()).toBe(exC)

    expect(tracked[4]!.peek()).toBeInstanceOf(ExB)
    expect(tracked[4]!.parent()).toBe(exC)

    expect(tracked[5]!.peek()).toBe(exC)
    expect(tracked[6]!.peek()).toBe(exec)

    expect(tracked[7]!.peek()).toBeInstanceOf(ExA)
    expect(tracked[7]!.parent()).toBe(exec)

    expect(tracked[8]!.peek()).toBe(exec)

    expect(finalized).toBe(true)
  })
})
