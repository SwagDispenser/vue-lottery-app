<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About author' },
  { to: '/users', label: 'Users' },
] as const

async function logout(): Promise<void> {
  auth.logout()
  await router.replace({ name: 'login' })
}
</script>

<template>
  <nav
    class="navigation"
    aria-label="Основна навігація"
  >
    <RouterLink
      v-for="link in links"
      :key="link.to"
      :to="link.to"
      class="navigation__link"
      :exact-active-class="link.to === '/' ? 'navigation__link--active' : undefined"
    >
      {{ link.label }}
    </RouterLink>
    <button
      v-if="auth.isAuthenticated"
      class="navigation__link navigation__logout"
      type="button"
      @click="logout"
    >
      Logout
    </button>
    <RouterLink
      v-else
      to="/login"
      class="navigation__link"
    >
      Login
    </RouterLink>
  </nav>
</template>

<style scoped lang="scss">
.navigation { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
.navigation__link { padding: 8px 12px; border-radius: 4px; color: #64757c; font-weight: 600; text-decoration: none; transition: background .15s, color .15s; }
.navigation__link:hover { color: #008fad; background: #eef9fc; }
.navigation__link.router-link-active, .navigation__link--active { color: #008fad; background: #e6f7fb; }
.navigation__logout { border: 0; background: transparent; }
@media (max-width: 620px) { .navigation { gap: 2px; } .navigation__link { padding: 7px 9px; font-size: 13px; } }
</style>
