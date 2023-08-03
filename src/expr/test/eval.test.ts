import { Eval } from '../eval'
import { Value } from '../value'
import { Read } from '../../command/read'
import { Steps } from '../../command/steps'
import { createStandardContext } from '../../eval'
import { providerFromFunctions } from '../../scope/provider/from-functions'
import { sourceFromProviders, storeFromProviders } from '../../scope/from-providers'
import { cached } from '../../scope/provider'
import { Flow } from '../../flow'


describe(Eval, () => {
  test('evaluates given expression.', async () => {
    const names = providerFromFunctions({
      'jack': cached(async () => 'JACK!'),
      'jill': cached(async () => 'JILL!'),
    })
    const source = sourceFromProviders({ names }, {})
    const context = createStandardContext(source)
    const exec =
      new Eval('Hellow {{ names.jack | lowercase }}, how is {{ names.jill | trim: 1 | Capital Case }} doing?', context)
        .run(new Flow())

    const res = await exec.execute()
    expect(res).toBe('Hellow jack!, how is Jill doing?')
  })

  test('runs given steps before hand.', async () => {
    const store = storeFromProviders({}, {})
    const context = createStandardContext(store)
    const steps = new Steps([
      new Read('var1', new Value('Jack'), store),
      new Read('var2', new Value('Jill'), store),
    ])

    const exec = new Eval('{{ var1 | lowercase }} vs {{ var2 | trim: ll | UPPERCASE }}', context, steps)
      .run(new Flow())
    const res = await exec.execute()

    expect(res).toBe('jack vs JI')
  })
})
