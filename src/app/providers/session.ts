import { watch } from 'vue'
import { useSessionStore } from '@/entities/session'
import { useUsersStore } from '@/entities/user'
import { httpClient } from './services'
import { pinia } from './pinia'

export function setupSession(): void {
  const session = useSessionStore(pinia)
  const users = useUsersStore(pinia)
  session.restoreSession()

  // Координація двох сутностей належить app: session не імпортує user.
  watch(() => session.user?.id, (id, previousId) => {
    if (id !== previousId) users.reset()
  }, { flush: 'sync' })

  httpClient.setAuthHandlers({
    getAccessToken: () => session.accessToken || null,
    refreshAccessToken: () => session.refreshAccessToken(),
    onUnauthorized: () => session.clearSession(),
  })
}
