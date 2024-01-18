import { Execution } from '../execution'
import { Flow } from '../flow'


class ExA extends Execution<number> {
  async run() { return 21 }
}

class ExB extends Execution<void> {
  async run() { }
}

class ExC extends Execution<number> {
  async run() {
    const res = await this.delegate(new ExA(this.flow))
    await this.delegate(new ExB(this.flow))

    return res * 3
  }
}

class ExD extends Execution<boolean> {
  async run() {
    const a = await this.delegate(new ExC(this.flow))
    const b = await this.delegate(new ExA(this.flow))

    return a - b === 42
  }
}


describe(Execution, () => {
  test('executes properly.', async () => {
    const exec = new ExD(new Flow({ onKill: jest.fn() }))
    const result = await exec.execute()

    expect(result).toBe(true)
  })


  test('emits proper execution stack.', async () => {
    const exec = new ExD(new Flow({ onKill: jest.fn() }))
    const trace = exec.trace()

    await trace.result

    expect(trace.stacks.length).toBe(9)
    expect(trace.stacks[0]!.peek()).toBe(exec)

    expect(trace.stacks[1]!.peek()).toBeInstanceOf(ExC)
    expect(trace.stacks[1]!.parent()).toBe(exec)
    const exC = trace.stacks[1]!.peek() as ExC

    expect(trace.stacks[2]!.peek()).toBeInstanceOf(ExA)
    expect(trace.stacks[2]!.parent()).toBe(exC)

    expect(trace.stacks[3]!.peek()).toBe(exC)

    expect(trace.stacks[4]!.peek()).toBeInstanceOf(ExB)
    expect(trace.stacks[4]!.parent()).toBe(exC)

    expect(trace.stacks[5]!.peek()).toBe(exC)
    expect(trace.stacks[6]!.peek()).toBe(exec)

    expect(trace.stacks[7]!.peek()).toBeInstanceOf(ExA)
    expect(trace.stacks[7]!.parent()).toBe(exec)

    expect(trace.stacks[8]!.peek()).toBe(exec)

    expect(trace.finalized).toBe(true)
  })
})
