<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <main class="not-found panel">
    <p class="not-found__code">
      404
    </p>
    <h1>Сторінку не знайдено</h1>
    <p>Перевірте адресу або поверніться до застосунку.</p>
    <RouterLink to="/">
      На головну →
    </RouterLink>
  </main>
</template>

<style scoped lang="scss">
.not-found { max-width: 680px; padding: 44px 32px; text-align: center; }
.not-found__code { margin: 0; color: var(--app-accent); font-size: 64px; font-weight: 800; line-height: 1; }
h1 { margin: 14px 0 10px; font-size: 28px; font-weight: 700; }
p { color: var(--app-muted); }
a { display: inline-block; margin-top: 14px; color: var(--app-accent); font-weight: 700; text-decoration: none; }
a:hover { text-decoration: underline; }
</style>
