<script setup lang="ts">
import { Logo } from '@/widgets/app-header'
import { ThemeToggle } from '@/features/theme'
</script>

<template>
  <main class="auth-layout">
    <div class="auth-layout__header">
      <Logo />
      <ThemeToggle />
    </div>
    <div class="auth-layout__content panel">
      <slot />
    </div>
  </main>
</template>

<style scoped lang="scss">
.auth-layout { width: min(100% - 32px, 440px); margin: 100px auto 60px; }
.auth-layout__header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.auth-layout__content { margin-top: 24px; padding: 28px; }
@media (max-width: 620px) { .auth-layout { margin-top: 40px; } }
</style>
