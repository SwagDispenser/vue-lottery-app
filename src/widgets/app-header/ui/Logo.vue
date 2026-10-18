<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineOptions({ name: 'AppLogo' })
</script>

<template>
  <RouterLink
    class="brand"
    to="/"
    aria-label="Vue Lottery — головна сторінка"
  >
    <svg
      class="brand__mark"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="1"
        y="1"
        width="38"
        height="38"
        rx="11"
        fill="var(--app-accent)"
      />
      <circle
        cx="15"
        cy="17"
        r="5"
        fill="white"
      />
      <circle
        cx="25"
        cy="17"
        r="5"
        fill="white"
        opacity=".72"
      />
      <path
        d="M13 27h14"
        stroke="white"
        stroke-width="2.5"
        stroke-linecap="round"
      />
    </svg>
    <span>Vue <strong>Lottery</strong></span>
  </RouterLink>
</template>

<style scoped lang="scss">
.brand { display: inline-flex; align-items: center; gap: 10px; color: var(--app-text); text-decoration: none; font-size: 18px; white-space: nowrap; }
.brand__mark { width: 40px; height: 40px; flex: none; }
.brand strong { color: var(--app-accent); }
</style>
