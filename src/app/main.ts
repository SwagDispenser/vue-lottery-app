import './styles/main.scss'

import { createApp } from 'vue'
import App from './App.vue'
import { httpClient } from '@/shared/api'
import { router } from './providers/router'
import { useAuthStore } from '@/entities/session'
import { pinia } from './providers/pinia'

const app = createApp(App)
app.use(pinia)

const auth = useAuthStore(pinia)
auth.restoreSession()
httpClient.setAuthHandlers({
  getAccessToken: () => auth.accessToken || null,
  refreshAccessToken: () => auth.refreshAccessToken(),
  onUnauthorized: () => auth.logout(),
})

app.use(router)
app.mount('#app')
