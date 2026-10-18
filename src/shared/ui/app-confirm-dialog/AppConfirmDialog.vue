<script setup lang="ts">
import { useId } from 'vue'
import Dialog from 'primevue/dialog'
import AppButton from '../app-button/AppButton.vue'

withDefaults(defineProps<{
  open: boolean
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  busy?: boolean
  error?: string
}>(), {
  title: 'Підтвердження видалення',
  confirmLabel: 'Так, видалити',
  cancelLabel: 'Скасувати',
  busy: false,
  error: '',
})
const emit = defineEmits<{ confirm: []; close: [] }>()
const descriptionId = useId()
</script>

<template>
  <Dialog
    :visible="open"
    :header="title"
    :aria-describedby="descriptionId"
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
    <p
      :id="descriptionId"
      class="app-confirm-dialog__message"
    >
      {{ message }}
    </p>
    <p
      v-if="error"
      class="app-confirm-dialog__error"
      role="alert"
    >
      {{ error }}
    </p>
    <template #footer>
      <AppButton
        variant="secondary"
        :disabled="busy"
        autofocus
        @click="emit('close')"
      >
        {{ cancelLabel }}
      </AppButton>
      <AppButton
        variant="danger"
        :loading="busy"
        @click="emit('confirm')"
      >
        {{ confirmLabel }}
      </AppButton>
    </template>
  </Dialog>
</template>

<style scoped lang="scss">
.app-confirm-dialog__message { margin: 0; overflow-wrap: anywhere; line-height: 1.6; }
.app-confirm-dialog__error { margin: 14px 0 0; color: var(--p-red-600, #bd3434); }
</style>
