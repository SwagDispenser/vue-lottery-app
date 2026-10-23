import './styles/main.scss'

import { createApp } from 'vue'
import App from './App.vue'
import { registerServices } from './providers/services'
import { setupSession } from './providers/session'
import { router } from './providers/router'
import { pinia } from './providers/pinia'
import { setupUi } from './providers/ui'
import { setupTheme } from './providers/theme'

registerServices()

const app = createApp(App)
app.use(pinia)
setupUi(app)
setupTheme()

setupSession()

app.use(router)
app.mount('#app')
