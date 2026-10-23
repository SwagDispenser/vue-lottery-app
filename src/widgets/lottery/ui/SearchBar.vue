<script setup lang="ts">
import { ref, useId, watch } from 'vue'
import { AppInput } from '@/shared/ui'

const emit = defineEmits<{ 'filter-by-name': [query: string] }>()
const search = ref('')
const inputId = useId()

watch(search, (value, _oldValue, onCleanup) => {
  const timer = window.setTimeout(() => emit('filter-by-name', value.trim()), 300)
  onCleanup(() => window.clearTimeout(timer))
})
</script>

<template>
  <div class="search-bar">
    <AppInput
      :id="inputId"
      v-model="search"
      label="Пошук учасника за іменем"
      type="search"
      placeholder="Search by name"
      :required="false"
    />
  </div>
</template>

<style scoped lang="scss">
.search-bar { width: min(100%, 280px); }
.search-bar :deep(.app-field) { margin-bottom: 0; }
</style>
