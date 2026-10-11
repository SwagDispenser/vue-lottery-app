<script setup lang="ts">
import Logo from '@/components/Logo.vue'
</script>

<template>
  <main class="auth-layout">
    <Logo />
    <div class="auth-layout__content panel">
      <slot />
    </div>
  </main>
</template>

<style scoped lang="scss">
.auth-layout { width: min(100% - 32px, 440px); margin: 100px auto 60px; }
.auth-layout__content { margin-top: 24px; padding: 28px; }
@media (max-width: 620px) { .auth-layout { margin-top: 40px; } }
</style>
