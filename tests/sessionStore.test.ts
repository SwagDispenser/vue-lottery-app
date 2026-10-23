import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { ServiceProvider } from '../src/shared/api'
import { useSessionStore, type AuthSession, type AuthTokens } from '../src/entities/session'

const session: AuthSession = {
  id: 1, username: 'emilys', email: 'emily@example.test', firstName: 'Emily',
  lastName: 'Johnson', gender: 'female', image: '',
  accessToken: 'test-access', refreshToken: 'test-refresh',
}
let data: Map<string, string>

beforeEach(() => {
  setActivePinia(createPinia())
  data = new Map()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => { data.set(key, value) },
    removeItem: (key: string) => { data.delete(key) },
  })
})
afterEach(() => vi.unstubAllGlobals())

function registerService() {
  const api = {
    login: vi.fn(async () => session),
    me: vi.fn(async () => ({ ...session, password: 'do-not-persist' })),
    refresh: vi.fn(async (): Promise<AuthTokens> => ({ accessToken: 'new-access', refreshToken: 'new-refresh' })),
  }
  ServiceProvider.register('auth', () => api)
  return api
}

describe('useSessionStore', () => {
  it('persists tokens/profile, restores them unverified and clears the session', async () => {
    registerService()
    const store = useSessionStore()
    await store.login({ username: 'emilys', password: 'password' })
    await nextTick()
    expect(store.isAuthenticated).toBe(true)
    expect(store.verified).toBe(true)
    const persisted = data.get('vue-lottery-auth')!
    expect(persisted).toContain('test-access')
    expect(persisted).not.toContain('password')
    expect(persisted).not.toContain('do-not-persist')
    const restored = useSessionStore(createPinia())
    restored.restoreSession()
    expect(restored.isAuthenticated).toBe(true)
    expect(restored.verified).toBe(false)
    restored.clearSession()
    await nextTick()
    expect(restored.isAuthenticated).toBe(false)
    expect(restored.user).toBeNull()
    expect(data.has('vue-lottery-auth')).toBe(false)
  })

  it('rejects malformed saved sessions without crashing', () => {
    data.set('vue-lottery-auth', '{broken json')
    const store = useSessionStore()
    store.restoreSession()
    expect(store.isAuthenticated).toBe(false)
    expect(store.storageError).toBeTruthy()
    data.set('vue-lottery-auth', JSON.stringify({ accessToken: 'x', refreshToken: 'y', user: { id: 1 } }))
    store.restoreSession()
    expect(store.isAuthenticated).toBe(false)
    expect(data.has('vue-lottery-auth')).toBe(false)
  })

  it('shares profile verification and clears rejected restored sessions', async () => {
    const api = registerService()
    const store = useSessionStore()
    store.setSession(session)
    expect(await Promise.all([store.ensureAuthenticated(), store.ensureAuthenticated()])).toEqual([true, true])
    expect(api.me).toHaveBeenCalledTimes(1)
    store.setSession(session)
    api.me.mockRejectedValueOnce(new Error('Unauthorized'))
    expect(await store.ensureAuthenticated()).toBe(false)
    expect(store.isAuthenticated).toBe(false)
  })

  it('does not restore tokens when refresh finishes after Logout', async () => {
    const api = registerService()
    let finish!: (tokens: AuthTokens) => void
    api.refresh.mockReturnValueOnce(new Promise<AuthTokens>((resolve) => { finish = resolve }))
    const store = useSessionStore()
    store.setSession(session)
    const refreshing = store.refreshAccessToken()
    store.clearSession()
    finish({ accessToken: 'late-access', refreshToken: 'late-refresh' })
    expect(await refreshing).toBeNull()
    expect(store.accessToken).toBe('')
    expect(store.refreshToken).toBe('')
  })

  it('does not restore a profile when verification finishes after Logout', async () => {
    const api = registerService()
    let finish!: (value: typeof session & { password: string }) => void
    api.me.mockReturnValueOnce(new Promise((resolve) => { finish = resolve }))
    const store = useSessionStore()
    store.setSession(session)
    const verifying = store.ensureAuthenticated()
    store.clearSession()
    finish({ ...session, password: 'do-not-persist' })
    expect(await verifying).toBe(false)
    expect(store.user).toBeNull()
    expect(store.verified).toBe(false)
  })
})
