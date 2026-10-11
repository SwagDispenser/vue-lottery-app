import './assets/main.scss'

import { createApp } from 'vue'
import App from './App.vue'
import { httpClient } from './api/httpClient'
import { router } from './router'
import { useAuthStore } from './stores/auth'
import { pinia } from './stores/pinia'

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
