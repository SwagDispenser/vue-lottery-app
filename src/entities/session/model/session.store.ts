import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { ServiceProvider } from '@/shared/api'
import type { AuthService } from '../api/auth.service'
import type { AuthSession, AuthUser, LoginDto } from './types'

const STORAGE_KEY = 'vue-lottery-auth'

function service(): AuthService {
  return ServiceProvider.get<AuthService>('auth')
}

function profileFromUser(profile: AuthUser): AuthUser {
  return {
    id: profile.id,
    username: profile.username,
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    gender: profile.gender,
    image: profile.image,
  }
}

interface StoredSession {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

function isStoredSession(value: unknown): value is StoredSession {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  if (typeof record.accessToken !== 'string' || !record.accessToken ||
    typeof record.refreshToken !== 'string' || !record.refreshToken ||
    typeof record.user !== 'object' || record.user === null) return false
  const user = record.user as Record<string, unknown>
  return Number.isSafeInteger(user.id) && Number(user.id) > 0 &&
    ['username', 'email', 'firstName', 'lastName', 'gender', 'image']
      .every((field) => typeof user[field] === 'string')
}

export const useSessionStore = defineStore('session', () => {
  const accessToken = ref('')
  const refreshToken = ref('')
  const user = ref<AuthUser | null>(null)
  const verified = ref(false)
  const storageError = ref('')
  const isAuthenticated = computed(() => Boolean(accessToken.value && refreshToken.value && user.value))
  let version = 0
  let verificationInFlight: Promise<boolean> | null = null

  // Ручне збереження залишено для порівняння з persistedstate у store налаштувань.
  watch([accessToken, refreshToken, user], () => {
    try {
      if (isAuthenticated.value) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          accessToken: accessToken.value,
          refreshToken: refreshToken.value,
          user: user.value,
        }))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
      storageError.value = ''
    } catch {
      storageError.value = 'Не вдалося зберегти сесію в браузері.'
    }
  }, { deep: true })

  function setSession(session: AuthSession): void {
    version += 1
    verificationInFlight = null
    accessToken.value = session.accessToken
    refreshToken.value = session.refreshToken
    // Пароль та інші зайві поля відповіді login не потрапляють у localStorage.
    user.value = profileFromUser(session)
    verified.value = false
  }

  function clearSession(): void {
    version += 1
    verificationInFlight = null
    accessToken.value = ''
    refreshToken.value = ''
    user.value = null
    verified.value = false
    try {
      localStorage.removeItem(STORAGE_KEY)
      storageError.value = ''
    } catch {
      storageError.value = 'Не вдалося очистити збережену сесію.'
    }
  }

  function restoreSession(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const stored: unknown = JSON.parse(raw)
      if (!isStoredSession(stored)) {
        clearSession()
        return
      }
      // Формат сховища з лабораторної №5 сумісний із новим store.
      setSession({ ...stored.user, accessToken: stored.accessToken, refreshToken: stored.refreshToken })
    } catch {
      clearSession()
      storageError.value = 'Не вдалося відновити сесію з браузера.'
    }
  }

  async function refreshAccessToken(): Promise<string | null> {
    if (!refreshToken.value) return null
    const currentVersion = version
    const tokens = await service().refresh(refreshToken.value)
    // Відповідь старого запиту не повинна відновлювати сесію після Logout.
    if (currentVersion !== version) return null
    accessToken.value = tokens.accessToken
    refreshToken.value = tokens.refreshToken
    return tokens.accessToken
  }

  async function ensureAuthenticated(): Promise<boolean> {
    if (!isAuthenticated.value) return false
    if (verified.value) return true
    if (!verificationInFlight) {
      const currentVersion = version
      verificationInFlight = service().me()
        .then((profile) => {
          if (currentVersion !== version) return false
          user.value = profileFromUser(profile)
          verified.value = true
          return true
        })
        .catch(() => {
          if (currentVersion === version) clearSession()
          return false
        })
        .finally(() => {
          if (currentVersion === version) verificationInFlight = null
        })
    }
    return verificationInFlight
  }

  async function login(credentials: LoginDto): Promise<void> {
    const currentVersion = version
    const session = await service().login(credentials)
    if (currentVersion !== version) throw new Error('Вхід скасовано.')
    setSession(session)
    if (!await ensureAuthenticated()) throw new Error('Не вдалося підтвердити сесію користувача.')
  }

  return {
    accessToken, refreshToken, user, verified, storageError, isAuthenticated,
    setSession, clearSession, restoreSession, refreshAccessToken, ensureAuthenticated, login,
  }
})
