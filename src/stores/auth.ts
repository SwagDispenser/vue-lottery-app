import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { services } from '@/repositories/ServiceProvider'
import { userDirectory } from '@/stores/userDirectory'
import type { AuthSession, AuthUser, LoginDto } from '@/types/auth'

const STORAGE_KEY = 'vue-lottery-auth'

function profileFromSession(session: AuthSession): AuthUser {
  return {
    id: session.id,
    username: session.username,
    email: session.email,
    firstName: session.firstName,
    lastName: session.lastName,
    gender: session.gender,
    image: session.image,
  }
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref('')
  const refreshToken = ref('')
  const user = ref<AuthUser | null>(null)
  const verified = ref(false)
  const storageError = ref('')
  const isAuthenticated = computed(() => Boolean(accessToken.value && refreshToken.value && user.value))
  let verificationInFlight: Promise<boolean> | null = null

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

  function restoreSession(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const stored: unknown = JSON.parse(raw)
      if (typeof stored !== 'object' || stored === null ||
        !('accessToken' in stored) || typeof stored.accessToken !== 'string' ||
        !('refreshToken' in stored) || typeof stored.refreshToken !== 'string' ||
        !('user' in stored) || typeof stored.user !== 'object' || stored.user === null ||
        !('id' in stored.user) || typeof stored.user.id !== 'number' ||
        !('username' in stored.user) || typeof stored.user.username !== 'string') {
        localStorage.removeItem(STORAGE_KEY)
        return
      }
      accessToken.value = stored.accessToken
      refreshToken.value = stored.refreshToken
      user.value = stored.user as AuthUser
      verified.value = false
    } catch {
      storageError.value = 'Не вдалося відновити сесію з браузера.'
    }
  }

  function logout(): void {
    accessToken.value = ''
    refreshToken.value = ''
    user.value = null
    verified.value = false
    userDirectory.reset()
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      storageError.value = 'Не вдалося очистити збережену сесію.'
    }
  }

  async function refreshAccessToken(): Promise<string | null> {
    if (!refreshToken.value) return null
    const tokens = await services.auth.refresh(refreshToken.value)
    accessToken.value = tokens.accessToken
    refreshToken.value = tokens.refreshToken
    return tokens.accessToken
  }

  async function ensureAuthenticated(): Promise<boolean> {
    if (!isAuthenticated.value) return false
    if (verified.value) return true
    if (!verificationInFlight) {
      verificationInFlight = services.auth.me()
        .then((profile) => {
          user.value = profile
          verified.value = true
          return true
        })
        .catch(() => {
          logout()
          return false
        })
        .finally(() => { verificationInFlight = null })
    }
    return verificationInFlight
  }

  async function login(credentials: LoginDto): Promise<void> {
    const session = await services.auth.login(credentials)
    accessToken.value = session.accessToken
    refreshToken.value = session.refreshToken
    user.value = profileFromSession(session)
    verified.value = false
    if (!await ensureAuthenticated()) throw new Error('Не вдалося підтвердити сесію користувача.')
  }

  return {
    accessToken,
    refreshToken,
    user,
    verified,
    storageError,
    isAuthenticated,
    restoreSession,
    logout,
    refreshAccessToken,
    ensureAuthenticated,
    login,
  }
})
