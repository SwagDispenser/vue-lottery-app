import './styles/main.scss'

import { createApp } from 'vue'
import App from './App.vue'
import { registerServices } from './providers/services'
import { setupSession } from './providers/session'
import { router } from './providers/router'
import { pinia } from './providers/pinia'

registerServices()

const app = createApp(App)
app.use(pinia)

setupSession()

app.use(router)
app.mount('#app')
