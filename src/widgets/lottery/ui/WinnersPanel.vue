<script setup lang="ts">
import { AppButton } from '@/shared/ui'
import WinnerItem from './WinnerItem.vue'
import type { Participant } from '@/entities/participant'

defineProps<{
  winners: Participant[]
  canDraw: boolean
}>()
const emit = defineEmits<{
  draw: []
  remove: [id: string]
}>()
</script>

<template>
  <section
    class="winners-panel panel"
    aria-label="Переможці"
  >
    <div
      class="winners-panel__list"
      aria-live="polite"
    >
      <WinnerItem
        v-for="winner in winners"
        :key="winner.id"
        :participant="winner"
        @remove="emit('remove', $event)"
      />
      <span class="winners-panel__placeholder">Winners</span>
    </div>
    <AppButton
      :disabled="!canDraw"
      @click="emit('draw')"
    >
      New winner
    </AppButton>
  </section>
</template>

<style scoped lang="scss">
.winners-panel { display: flex; gap: 22px; align-items: center; padding: 16px 20px; }
.winners-panel__list {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  align-items: center;
  min-height: 38px;
  gap: 5px;
  padding: 6px 10px;
  border: 1px solid var(--app-border);
  border-radius: 4px;
}
.winners-panel__placeholder { color: var(--app-subtle); font-size: 14px; margin-left: 3px; }
@media (max-width: 520px) { .winners-panel { align-items: stretch; flex-direction: column; gap: 12px; } }
</style>
