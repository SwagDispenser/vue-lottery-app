<script setup lang="ts">
import { ref, watch } from 'vue'

const emit = defineEmits<{ 'filter-by-name': [query: string] }>()
const search = ref('')

watch(search, (value, _oldValue, onCleanup) => {
  const timer = window.setTimeout(() => emit('filter-by-name', value.trim()), 300)
  onCleanup(() => window.clearTimeout(timer))
})
</script>

<template>
  <label class="search-bar">
    <span class="visually-hidden">Пошук учасника за іменем</span>
    <svg
      class="search-bar__icon"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <circle
        cx="7"
        cy="7"
        r="4.5"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      />
      <path
        d="m10.5 10.5 3.7 3.7"
        stroke="currentColor"
        stroke-width="1.5"
      />
    </svg>
    <input
      v-model="search"
      class="form-control"
      type="search"
      placeholder="Search by name"
    >
  </label>
</template>

<style scoped lang="scss">
.search-bar { display: block; position: relative; width: min(100%, 260px); }
.search-bar__icon { position: absolute; left: 10px; top: 9px; width: 16px; height: 16px; color: #9aa8ae; pointer-events: none; }
input { min-height: 35px; padding-left: 33px; border-radius: 3px; font-size: 13px; }
</style>
