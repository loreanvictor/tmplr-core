import { STANDARD_PIPES } from '../std'


describe('standard pipes', () => {
  test('the standard pipes work as expected.', () => {
    expect(STANDARD_PIPES.camelCase('hello world')).toBe('helloWorld')
    expect(STANDARD_PIPES['Capital Case']('hello world')).toBe('Hello World')
    expect(STANDARD_PIPES.CONSTANT_CASE('hello world')).toBe('HELLO_WORLD')
    expect(STANDARD_PIPES['dot.case']('hello world')).toBe('hello.world')
    expect(STANDARD_PIPES['Header-Case']('hello world')).toBe('Hello-World')
    expect(STANDARD_PIPES['param-case']('hello world')).toBe('hello-world')
    expect(STANDARD_PIPES['kebab-case']('hello world')).toBe('hello-world')
    expect(STANDARD_PIPES.PascalCase('hello world')).toBe('HelloWorld')
    expect(STANDARD_PIPES['path/case']('hello world')).toBe('hello/world')
    expect(STANDARD_PIPES['Sentence case']('hello world')).toBe('Hello world')
    expect(STANDARD_PIPES.snake_case('hello world')).toBe('hello_world')
    expect(STANDARD_PIPES.UPPERCASE('hello world')).toBe('HELLO WORLD')
    expect(STANDARD_PIPES.lowercase('hello world')).toBe('hello world')
    expect(STANDARD_PIPES.skip('hello world', 2)).toBe('llo world')
    expect(STANDARD_PIPES.skip('hello world', 'hell')).toBe('o world')
    expect(STANDARD_PIPES.trim('hello world', 2)).toBe('hello wor')
    expect(STANDARD_PIPES.trim('hello world', 'ld')).toBe('hello wor')
    expect(STANDARD_PIPES.matches('hellow world', 'hellow world')).toBe('hellow world')
    expect(STANDARD_PIPES.matches('hellow world', 'hellow')).toBe('')
    expect(STANDARD_PIPES.matches('hellow world', '/hellow/')).toBe('hellow world')
    expect(STANDARD_PIPES.matches('hellow world', '/hellow$/')).toBe('')
  })
})
