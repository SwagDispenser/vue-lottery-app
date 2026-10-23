<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useSessionStore } from '@/entities/session'
import { LogoutButton } from '@/features/auth'

const { isAuthenticated } = storeToRefs(useSessionStore())

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About author' },
  { to: '/users', label: 'Users' },
] as const
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
    <LogoutButton v-if="isAuthenticated" />
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
.navigation__link { padding: 8px 12px; border-radius: 4px; color: var(--app-muted); font-weight: 600; text-decoration: none; transition: background .15s, color .15s; }
.navigation__link:hover { color: var(--app-accent); background: var(--app-hover); }
.navigation__link.router-link-active, .navigation__link--active { color: var(--app-accent); background: var(--app-active); }
@media (max-width: 620px) { .navigation { gap: 2px; } .navigation__link { padding: 7px 9px; font-size: 13px; } }
</style>
