<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { AppModal, AppConfirmDialog, useNotification } from '@/shared/ui'
import ParticipantFields from './ParticipantFields.vue'
import ParticipantsTable from './ParticipantsTable.vue'
import RegistrationForm from './RegistrationForm.vue'
import WinnersPanel from './WinnersPanel.vue'
import type { Participant, ParticipantInput } from '@/entities/participant'
import { normalizeEmail } from '@/entities/participant'

const STORAGE_KEY = 'vue-lottery-participants'
const notification = useNotification()

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
const deleteMessage = computed(() => deletingParticipant.value
  ? `Ви дійсно бажаєте видалити учасника "${deletingParticipant.value.name}", "${deletingParticipant.value.email}"?`
  : '')
const storageError = ref('')

watch(participants, (value) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    storageError.value = ''
  } catch {
    storageError.value = 'Не вдалося зберегти учасників у браузері.'
    notification.error(storageError.value)
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
  notification.success('Учасника зареєстровано.')
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
  notification.success('Дані учасника оновлено.')
  editingParticipant.value = null
}

function deleteParticipant(): void {
  if (!deletingParticipant.value) return
  const id = deletingParticipant.value.id
  participants.value = participants.value.filter((participant) => participant.id !== id)
  winnerIds.value = winnerIds.value.filter((winnerId) => winnerId !== id)
  deletingParticipant.value = null
  notification.success('Учасника видалено.')
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

  <AppConfirmDialog
    v-if="deletingParticipant"
    :open="true"
    title="Видалення учасника"
    :message="deleteMessage"
    confirm-label="Так"
    cancel-label="Ні"
    @confirm="deleteParticipant"
    @close="deletingParticipant = null"
  />
</template>

<style scoped lang="scss">
.lottery-app { width: min(100%, 802px); margin: 28px auto 80px; }
.lottery-app > :not(:last-child) { margin-bottom: 18px; }
.lottery-app__error { padding: 10px 14px; border: 1px solid var(--app-error-border); border-radius: 4px; color: var(--app-error-text); background: var(--app-error-bg); }
@media (max-width: 700px) { .lottery-app { margin-top: 32px; } }
</style>
