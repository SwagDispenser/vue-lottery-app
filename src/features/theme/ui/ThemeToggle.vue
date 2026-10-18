<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/entities/settings'
import { AppButton } from '@/shared/ui'

const settings = useSettingsStore()
const { isDark } = storeToRefs(settings)
</script>

<template>
  <AppButton
    class="theme-toggle"
    variant="secondary"
    :aria-pressed="isDark"
    :aria-label="isDark ? 'Увімкнути світлу тему' : 'Увімкнути темну тему'"
    @click="settings.toggleTheme"
  >
    {{ isDark ? 'Світла тема' : 'Темна тема' }}
  </AppButton>
</template>

<style scoped lang="scss">
.theme-toggle { font-size: 12px; }
</style>
