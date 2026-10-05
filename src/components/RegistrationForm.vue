<script setup lang="ts">
import ParticipantFields from './ParticipantFields.vue'
import type { Participant, ParticipantInput } from '@/types/participant'

defineProps<{ participants: Participant[] }>()
const emit = defineEmits<{ register: [participant: ParticipantInput] }>()
</script>

<template>
  <section
    class="register-panel panel"
    aria-labelledby="register-title"
  >
    <h2 id="register-title">
      REGISTER FORM
    </h2>
    <p>Please fill in all the fields.</p>
    <ParticipantFields
      :participants="participants"
      @save="emit('register', $event)"
    />
  </section>
</template>

<style scoped lang="scss">
.register-panel { padding: 18px 20px 20px; }
h2 { font-size: 16px; font-weight: 700; line-height: 1.3; margin: 0 0 2px; }
p { color: #8ea5b0; margin: 0 0 26px; }
</style>
