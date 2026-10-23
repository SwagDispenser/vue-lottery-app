<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { AuthLayout, DefaultLayout } from './layouts'
import { AppNotifications } from '@/shared/ui'

const route = useRoute()
const layout = computed(() => route.meta.layout === 'auth' ? AuthLayout : DefaultLayout)
</script>

<template>
  <AppNotifications />
  <component :is="layout">
    <RouterView />
  </component>
</template>
