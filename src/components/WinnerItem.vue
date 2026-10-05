<script setup lang="ts">
import type { Participant } from '@/types/participant'

defineProps<{ participant: Participant }>()
const emit = defineEmits<{ remove: [id: string] }>()
</script>

<template>
  <span class="winner-item">
    <span>{{ participant.name }}</span>
    <button
      type="button"
      :aria-label="`Видалити переможця ${participant.name}`"
      @click="emit('remove', participant.id)"
    >×</button>
  </span>
</template>

<style scoped lang="scss">
.winner-item {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: #00acd2;
  color: #fff;
  border-radius: 2px;
  font-size: 12px;
  font-weight: 600;
  line-height: 20px;
  padding: 0 5px 0 7px;
  white-space: nowrap;

  button { border: 0; padding: 0; background: transparent; color: inherit; font-size: 16px; line-height: 1; }
  button:hover { color: #d7f7ff; }
}
</style>
