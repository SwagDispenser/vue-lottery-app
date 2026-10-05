<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'

defineProps<{ title: string }>()
const emit = defineEmits<{ close: [] }>()
const dialog = ref<HTMLElement | null>(null)

onMounted(async () => {
  await nextTick()
  dialog.value?.focus()
})
</script>

<template>
  <Teleport to="body">
    <div
      class="app-modal__backdrop"
      @click.self="emit('close')"
    >
      <section
        ref="dialog"
        class="app-modal"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        tabindex="-1"
        @keydown.esc="emit('close')"
      >
        <header class="app-modal__header">
          <h2>{{ title }}</h2>
          <button
            type="button"
            aria-label="Закрити вікно"
            @click="emit('close')"
          >
            ×
          </button>
        </header>
        <div class="app-modal__body">
          <slot />
        </div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
.app-modal__backdrop {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgba(16, 35, 43, .52);
}
.app-modal {
  width: min(100%, 540px);
  max-height: min(90vh, 800px);
  overflow-y: auto;
  background: #fff;
  border-radius: 5px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, .2);
  outline: none;
}
.app-modal__header { display: flex; justify-content: space-between; align-items: center; padding: 17px 20px; border-bottom: 1px solid #e9ecee; }
.app-modal__header h2 { margin: 0; font-size: 18px; font-weight: 600; }
.app-modal__header button { border: 0; background: transparent; color: #718087; font-size: 26px; line-height: 1; }
.app-modal__body { padding: 20px; }
</style>
