import { storeFromProviders } from '../../scope/from-providers'
import { Value } from '../../expr/value'
import { Read } from '../read'
import { Flow } from '../../flow'


describe(Read, () => {
  test('reads a value into a variable.', async () => {
    const store = storeFromProviders({})
    const exec = new Read('foo', new Value('bar'), store).run(new Flow())
    await exec.execute()

    await expect(store.get('foo')).resolves.toBe('bar')
  })
})
