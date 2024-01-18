import { Flow } from '../flow'
import { IOExecution, Unpluggable } from '../io'


interface DummyIO extends Unpluggable {
  unplug()
  hellow(name: string)
}


class DummyIOExecution extends IOExecution<void, DummyIO> {
  async run() {
    const io = await this.connect()
    io.hellow('World')
    io.unplug()
  }
}


describe(IOExecution, () => {
  test('provides an IO interface for the child execution.', async () => {
    const exec = new DummyIOExecution(new Flow({ onKill: jest.fn() }))
    const io: DummyIO = {
      unplug: jest.fn(),
      hellow: jest.fn(),
    }

    await Promise.all([
      exec.execute(),
      (async() => exec.plug(() => io))()
    ])

    expect(io.hellow).toHaveBeenCalledWith('World')
    expect(io.unplug).toHaveBeenCalled()
  })

  test('can be unplugged and replugged to a connector.', async () => {
    const exec = new DummyIOExecution(new Flow({ onKill: jest.fn() }))
    const io1: DummyIO = { unplug: jest.fn(), hellow: jest.fn() }
    const io2: DummyIO = { unplug: jest.fn(), hellow: jest.fn() }

    exec.plug(() => io1)
    exec.unplug()
    exec.plug(() => io2)

    await exec.execute()

    expect(io2.unplug).toHaveBeenCalled()
    expect(io2.hellow).toHaveBeenCalledWith('World')
    expect(io1.unplug).not.toHaveBeenCalled()
  })
})
