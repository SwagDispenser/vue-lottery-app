<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { AuthLayout, DefaultLayout } from './layouts'

const route = useRoute()
const layout = computed(() => route.meta.layout === 'auth' ? AuthLayout : DefaultLayout)
</script>

<template>
  <component :is="layout">
    <RouterView />
  </component>
</template>
