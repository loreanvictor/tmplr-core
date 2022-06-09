import { EvaluationContext } from '../context'
import { cached } from '../../scope/provider/cached'
import { providerFromFunctions } from '../../scope/provider/from-functions'
import { sourceFromProviders } from '../../scope/from-providers'
import { STANDARD_PIPES } from '../pipe'


describe(EvaluationContext, () => {
  test('replaces vars in text from given source.', async () => {
    const names = providerFromFunctions({
      'jack': cached(async () => 'JACK!'),
      'jill': cached(async () => 'JILL!'),
    })

    const source = sourceFromProviders({ names }, {})
    const context = new EvaluationContext(source)

    const res = await context.evaluate('Hellow {{ names.jack}}, how is {{ names.jill }} doing?')
    expect(res).toBe('Hellow JACK!, how is JILL! doing?')
  })


  test('does not touch non existing variables.', async () => {
    const _ = providerFromFunctions({
      'jack': cached(async () => 'JACK!'),
    })

    const source = sourceFromProviders({ _ }, { 'jill': 'JILL!' })
    const context = new EvaluationContext(source)

    const res = await context.evaluate(
      'Hellow {{_.jack}}, how is {{ _.jill   }} doing? Whats up with {{ jill }}?'
    )
    expect(res).toBe('Hellow JACK!, how is {{ _.jill   }} doing? Whats up with JILL!?')
  })


  test('applies pipes properly.', async () => {
    const vars = providerFromFunctions({
      'name': cached(async () => 'john Doe'),
    })

    const source = sourceFromProviders({ vars }, {})
    const context = new EvaluationContext(source, STANDARD_PIPES)
    context.pipes.add('* case', (str: string) => '*'.repeat(str.length))

    const res1 = await context.evaluate('Hello {{ vars.name | UPPERCASE }}!!')
    const res2 = await context.evaluate('Hello {{ vars.name | kebab-case | skip :2 }}!!')
    const res3 = await context.evaluate('Hello {{ vars.name | trim :2 | path/case }}!!')
    const res4 = await context.evaluate('Hello {{ vars.name | trim: 1 | Capital Case }}!!')
    const res5 = await context.evaluate('Hello {{ vars.name | snake_case | dot.case }}!!')
    const res6 = await context.evaluate('Hello {{ vars.name | trim:1 | skip : 1 }}!!')
    const res7 = await context.evaluate('Hello {{ vars.name | skip: jo | trim: x }}!!')
    const res8 = await context.evaluate('Hello {{ vars.name | skip: lu | trim: oe }}!!')
    const res9 = await context.evaluate('Hello {{ vars.name | weird }}!!')
    const res10 = await context.evaluate('Hello {{ vars.name | * case }}!!')

    expect(res1).toBe('Hello JOHN DOE!!')
    expect(res2).toBe('Hello hn-doe!!')
    expect(res3).toBe('Hello john/d!!')
    expect(res4).toBe('Hello John Do!!')
    expect(res5).toBe('Hello john.doe!!')
    expect(res6).toBe('Hello ohn Do!!')
    expect(res7).toBe('Hello hn Doe!!')
    expect(res8).toBe('Hello john D!!')
    expect(res9).toBe('Hello {{ vars.name | weird }}!!')
    expect(res10).toBe('Hello ********!!')
  })

  test('applies multiple piped strings properly too.', async () => {
    const vars = providerFromFunctions({
      'name': cached(async () => 'john Doe'),
    })

    const source = sourceFromProviders({ vars }, {})
    const context = new EvaluationContext(source, STANDARD_PIPES)

    const res = await context.evaluate('Hellow {{ vars.name | UPPERCASE }} ({{ vars.name | PascalCase }})')
    expect(res).toBe('Hellow JOHN DOE (JohnDoe)')
  })
})

