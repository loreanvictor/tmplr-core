import { NULL_SOURCE } from '../source'
import { NULL_STORE } from '../store'
import { NULL_SCOPE } from '../scope'


describe('NULL_SOURCE', () => {
  test('cannot get values on it,', async () => {
    await expect(async () => NULL_SOURCE.get('foo')).rejects.toThrow(ReferenceError)
  })

  test('has no values.', () => {
    expect(NULL_SOURCE.has('foo')).toBe(false)
    expect(NULL_SOURCE.has('bar')).toBe(false)
  })

  test('can be cleaned.', async () => {
    await NULL_SOURCE.cleanup()
  })
})


describe('NULL_STORE', () => {
  test('cannot get values on it,', async () => {
    await expect(async () => NULL_STORE.get('foo')).rejects.toThrow(ReferenceError)
  })

  test('cannot set values on it.', async () => {
    await expect(async () => NULL_STORE.set('foo', 'bar')).rejects.toThrow(TypeError)
  })

  test('has no values.', () => {
    expect(NULL_STORE.has('foo')).toBe(false)
    expect(NULL_STORE.has('bar')).toBe(false)
  })
})


describe('NULL_SCOPE', () => {
  test('cannot get values on it,', async () => {
    await expect(async () => NULL_SCOPE.get('foo')).rejects.toThrow(ReferenceError)
  })

  test('has no values.', () => {
    expect(NULL_SCOPE.has('foo')).toBe(false)
    expect(NULL_SCOPE.has('bar')).toBe(false)
  })

  test('cannot set values on it.', async () => {
    await expect(async () => NULL_SCOPE.set('foo', 'bar')).rejects.toThrow(TypeError)
  })

  test('is its own sub-scope.', () => {
    expect(NULL_SCOPE.sub({})).toBe(NULL_SCOPE)
  })

  test('its var source is NULL.', () => {
    expect(NULL_SCOPE.vars).toBe(NULL_SOURCE)
  })
})
