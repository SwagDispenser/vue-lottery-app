import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick } from 'vue'
import { createPinia, disposePinia, type Pinia } from 'pinia'
import persistedstate from 'pinia-plugin-persistedstate'
import { useSettingsStore } from '../src/entities/settings'
import { useSessionStore, type AuthSession } from '../src/entities/session'

let data: Map<string, string>
const instances: Pinia[] = []

function installedPinia(): Pinia {
  const pinia = createPinia().use(persistedstate)
  createApp({}).use(pinia)
  instances.push(pinia)
  return pinia
}

beforeEach(() => {
  data = new Map()
  const storage = {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => { data.set(key, value) },
    removeItem: (key: string) => { data.delete(key) },
  }
  vi.stubGlobal('window', { localStorage: storage })
  vi.stubGlobal('localStorage', storage)
})

afterEach(() => {
  for (const pinia of instances.splice(0)) disposePinia(pinia)
  vi.unstubAllGlobals()
})

describe('settings persistence', () => {
  it('persists only theme and hydrates a new store through the actual plugin', async () => {
    const settings = useSettingsStore(installedPinia())
    settings.setTheme('dark')
    await nextTick()
    expect(JSON.parse(data.get('vue-lottery-settings')!)).toEqual({ theme: 'dark' })
    const restored = useSettingsStore(installedPinia())
    expect(restored.theme).toBe('dark')
    expect(restored.isDark).toBe(true)
  })

  it('keeps a valid light default when saved JSON or its theme is invalid', () => {
    for (const value of ['{broken', '{"theme":"unexpected"}', '{"theme":"light","isDark":true}']) {
      data.set('vue-lottery-settings', value)
      const settings = useSettingsStore(installedPinia())
      expect(settings.theme).toBe('light')
      expect(settings.isDark).toBe(false)
    }
  })

  it('keeps settings when the manually persisted session is cleared', async () => {
    const pinia = installedPinia()
    const settings = useSettingsStore(pinia)
    settings.setTheme('dark')
    const auth = useSessionStore(pinia)
    const session: AuthSession = {
      id: 1, firstName: 'Test', lastName: 'User', username: 'test', email: 'test@example.test',
      gender: 'other', image: '', accessToken: 'test-access', refreshToken: 'test-refresh',
    }
    auth.setSession(session)
    await nextTick()
    expect(data.has('vue-lottery-auth')).toBe(true)
    expect(data.has('session')).toBe(false)
    auth.clearSession()
    await nextTick()
    expect(data.has('vue-lottery-auth')).toBe(false)
    expect(JSON.parse(data.get('vue-lottery-settings')!)).toEqual({ theme: 'dark' })
    expect(settings.isDark).toBe(true)
  })
})
