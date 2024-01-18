import { Flow } from '../flow'


describe(Flow, () => {
  test('can be broken.', () => {
    const flow = new Flow({ onKill: jest.fn() })
    expect(flow.broken).toBe(false)

    flow.break()
    expect(flow.broken).toBe(true)
  })

  test('can be forked.', () => {
    const parent = new Flow({ onKill: jest.fn() })
    const child = parent.fork()

    expect(parent.broken).toBe(false)
    expect(child.broken).toBe(false)

    child.break()
    expect(parent.broken).toBe(false)
    expect(child.broken).toBe(true)
  })

  test('parents cascade break to children.', () => {
    const parent = new Flow({ onKill: jest.fn() })
    const child = parent.fork()

    expect(parent.broken).toBe(false)
    expect(child.broken).toBe(false)

    parent.break()
    expect(parent.broken).toBe(true)
    expect(child.broken).toBe(true)
  })

  test('children can cascade break to parent.', () => {
    const parent = new Flow({ onKill: jest.fn() })
    const child = parent.fork()

    expect(parent.broken).toBe(false)
    expect(child.broken).toBe(false)

    child.break(true)
    expect(parent.broken).toBe(true)
    expect(child.broken).toBe(true)
  })

  test('siblings break independently.', () => {
    const parent = new Flow({ onKill: jest.fn() })
    const child1 = parent.fork()
    const child2 = parent.fork()

    expect(parent.broken).toBe(false)
    expect(child1.broken).toBe(false)
    expect(child2.broken).toBe(false)

    child1.break()
    expect(parent.broken).toBe(false)
    expect(child1.broken).toBe(true)
    expect(child2.broken).toBe(false)
  })

  test('break when a sibling breaks cascadingly.', () => {
    const parent = new Flow({ onKill: jest.fn() })
    const child1 = parent.fork()
    const child2 = parent.fork()

    expect(parent.broken).toBe(false)
    expect(child1.broken).toBe(false)
    expect(child2.broken).toBe(false)

    child1.break(true)
    expect(parent.broken).toBe(true)
    expect(child1.broken).toBe(true)
    expect(child2.broken).toBe(true)
  })

  test('can register callbacks for when flow is killed.', () => {
    const kill = jest.fn()
    const flow = new Flow({ onKill: kill })

    expect(kill).not.toHaveBeenCalled()

    const handler = jest.fn()
    flow.onKill(handler)

    expect(kill).toHaveBeenCalledWith(handler)
  })

  test('inherits its environment from parent.', () => {
    const kill = jest.fn()
    const flow = new Flow({ onKill: kill })
    const child = flow.fork()

    expect(kill).not.toHaveBeenCalled()

    const handler = jest.fn()
    child.onKill(handler)

    expect(kill).toHaveBeenCalledWith(handler)
  })
})
