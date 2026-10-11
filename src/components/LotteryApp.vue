<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppButton from './AppButton.vue'
import AppModal from './AppModal.vue'
import ParticipantFields from './ParticipantFields.vue'
import ParticipantsTable from './ParticipantsTable.vue'
import RegistrationForm from './RegistrationForm.vue'
import WinnersPanel from './WinnersPanel.vue'
import type { Participant, ParticipantInput } from '../types/participant'
import { normalizeEmail } from '../utils/validation'

const STORAGE_KEY = 'vue-lottery-participants'

function restoreParticipants(): Participant[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return []
    const parsed: unknown = JSON.parse(saved)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is Participant =>
      typeof item === 'object' && item !== null &&
      typeof item.id === 'string' && typeof item.name === 'string' &&
      typeof item.birthDate === 'string' && typeof item.email === 'string' &&
      typeof item.phone === 'string',
    )
  } catch {
    return []
  }
}

const participants = ref<Participant[]>(restoreParticipants())
const winnerIds = ref<string[]>([])
const editingParticipant = ref<Participant | null>(null)
const deletingParticipant = ref<Participant | null>(null)
const storageError = ref('')

watch(participants, (value) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    storageError.value = ''
  } catch {
    storageError.value = 'Не вдалося зберегти учасників у браузері.'
  }
}, { deep: true })

const winners = computed(() => winnerIds.value
  .map((id) => participants.value.find((participant) => participant.id === id))
  .filter((participant): participant is Participant => Boolean(participant)))

const eligibleParticipants = computed(() => participants.value.filter(
  (participant) => !winnerIds.value.includes(participant.id),
))
const canDraw = computed(() => winners.value.length < 3 && eligibleParticipants.value.length > 0)

function registerParticipant(input: ParticipantInput): void {
  if (participants.value.some((participant) => normalizeEmail(participant.email) === normalizeEmail(input.email))) return
  participants.value.push({ id: crypto.randomUUID(), ...input })
}

function drawWinner(): void {
  if (!canDraw.value) return
  const index = Math.floor(Math.random() * eligibleParticipants.value.length)
  const winner = eligibleParticipants.value[index]
  if (winner) winnerIds.value.push(winner.id)
}

function updateParticipant(input: ParticipantInput): void {
  if (!editingParticipant.value) return
  Object.assign(editingParticipant.value, input)
  editingParticipant.value = null
}

function deleteParticipant(): void {
  if (!deletingParticipant.value) return
  const id = deletingParticipant.value.id
  participants.value = participants.value.filter((participant) => participant.id !== id)
  winnerIds.value = winnerIds.value.filter((winnerId) => winnerId !== id)
  deletingParticipant.value = null
}
</script>

<template>
  <section
    class="lottery-app"
    aria-label="Лотерея"
  >
    <p
      v-if="storageError"
      class="lottery-app__error"
      role="alert"
    >
      {{ storageError }}
    </p>
    <WinnersPanel
      :winners="winners"
      :can-draw="canDraw"
      @draw="drawWinner"
      @remove="winnerIds = winnerIds.filter((id) => id !== $event)"
    />
    <RegistrationForm
      :participants="participants"
      @register="registerParticipant"
    />
    <ParticipantsTable
      :participants="participants"
      @edit="editingParticipant = $event"
      @delete="deletingParticipant = $event"
    />
  </section>

  <AppModal
    v-if="editingParticipant"
    title="Редагувати дані учасника"
    @close="editingParticipant = null"
  >
    <ParticipantFields
      :key="editingParticipant.id"
      :participants="participants"
      :initial="editingParticipant"
      mode="edit"
      @save="updateParticipant"
    />
  </AppModal>

  <AppModal
    v-if="deletingParticipant"
    title="Видалення учасника"
    @close="deletingParticipant = null"
  >
    <p class="lottery-app__confirm-text">
      Ви дійсно бажаєте видалити учасника "{{ deletingParticipant.name }}", "{{ deletingParticipant.email }}"?
    </p>
    <div class="lottery-app__confirm-actions">
      <AppButton
        variant="danger"
        @click="deleteParticipant"
      >
        Так
      </AppButton>
      <AppButton
        variant="secondary"
        @click="deletingParticipant = null"
      >
        Ні
      </AppButton>
    </div>
  </AppModal>
</template>

<style scoped lang="scss">
.lottery-app { width: min(100%, 802px); margin: 28px auto 80px; }
.lottery-app > :not(:last-child) { margin-bottom: 18px; }
.lottery-app__error { padding: 10px 14px; border: 1px solid #f3c4c4; border-radius: 4px; color: #a43636; background: #fff4f4; }
.lottery-app__confirm-text { margin: 0 0 24px; }
.lottery-app__confirm-actions { display: flex; justify-content: flex-end; gap: 10px; }
@media (max-width: 700px) { .lottery-app { margin-top: 32px; } }
</style>
