<script setup lang="ts">
import Toast from 'primevue/toast'
</script>

<template>
  <Toast
    position="top-right"
    :breakpoints="{ '620px': { width: 'calc(100vw - 24px)', right: '12px', left: '12px' } }"
  />
</template>
