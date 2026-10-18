<script setup lang="ts">
import AppNavigation from './AppNavigation.vue'
import Logo from './Logo.vue'
import { ThemeToggle } from '@/features/theme'
</script>

<template>
  <header class="app-header">
    <div class="app-header__inner">
      <Logo />
      <div class="app-header__controls">
        <AppNavigation />
        <ThemeToggle />
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
.app-header { background: var(--app-surface); border-bottom: 1px solid var(--app-border); }
.app-header__inner { width: min(100% - 32px, 1040px); min-height: 74px; margin: auto; display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.app-header__controls { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; }
@media (max-width: 620px) { .app-header__inner { padding: 12px 0; align-items: flex-start; flex-direction: column; gap: 10px; } }
</style>
