<script setup lang="ts">
import AppNavigation from './AppNavigation.vue'
import Logo from './Logo.vue'
</script>

<template>
  <header class="app-header">
    <div class="app-header__inner">
      <Logo />
      <AppNavigation />
    </div>
  </header>
</template>

<style scoped lang="scss">
.app-header { background: #fff; border-bottom: 1px solid #e1e6e8; }
.app-header__inner { width: min(100% - 32px, 1040px); min-height: 74px; margin: auto; display: flex; align-items: center; justify-content: space-between; gap: 20px; }
@media (max-width: 620px) { .app-header__inner { padding: 12px 0; align-items: flex-start; flex-direction: column; gap: 10px; } }
</style>
