import { describe, expect, it, vi } from 'vitest'
import { ServiceProvider } from '../src/shared/api'

describe('ServiceProvider', () => {
  it('creates a service lazily and shares its instance', () => {
    const instance = { name: 'users' }
    const factory = vi.fn(() => instance)
    ServiceProvider.register('test:lazy', factory)

    expect(factory).not.toHaveBeenCalled()
    expect(ServiceProvider.get<typeof instance>('test:lazy')).toBe(instance)
    expect(ServiceProvider.get<typeof instance>('test:lazy')).toBe(instance)
    expect(factory).toHaveBeenCalledTimes(1)
  })

  it('reports an unregistered service instead of returning undefined', () => {
    expect(() => ServiceProvider.get('test:missing'))
      .toThrow('Сервіс "test:missing" не зареєстровано.')
  })

  it('replaces a cached service when a new factory is registered', () => {
    const original = { version: 1 }
    const replacement = { version: 2 }
    ServiceProvider.register('test:replace', () => original)
    expect(ServiceProvider.get<typeof original>('test:replace')).toBe(original)

    const factory = vi.fn(() => replacement)
    ServiceProvider.register('test:replace', factory)

    expect(factory).not.toHaveBeenCalled()
    expect(ServiceProvider.get<typeof replacement>('test:replace')).toBe(replacement)
    expect(factory).toHaveBeenCalledTimes(1)
  })
})
