<script setup lang="ts">
import Dialog from 'primevue/dialog'

withDefaults(defineProps<{ title: string; busy?: boolean }>(), { busy: false })
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <Dialog
    :visible="true"
    :header="title"
    modal
    block-scroll
    :draggable="false"
    :closable="!busy"
    :close-on-escape="!busy"
    :dismissable-mask="!busy"
    :close-button-props="{ 'aria-label': 'Закрити вікно' }"
    :style="{ width: 'min(540px, calc(100vw - 36px))' }"
    @update:visible="!$event && emit('close')"
  >
    <slot />
  </Dialog>
</template>
