<script setup lang="ts">
import { AppHeader } from '@/widgets/app-header'
</script>

<template>
  <AppHeader />
  <div class="default-layout">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.default-layout { width: min(100% - 32px, 1040px); margin: 0 auto; padding: 36px 0 72px; }
</style>
