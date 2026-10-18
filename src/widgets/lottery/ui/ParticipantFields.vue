<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { AppButton } from '@/shared/ui'
import { AppInput } from '@/shared/ui'
import type { Participant, ParticipantInput } from '@/entities/participant'
import { todayLocalDate, validateParticipant, type ParticipantField } from '@/entities/participant'

const props = withDefaults(defineProps<{
  participants: Participant[]
  initial?: Participant | null
  mode?: 'create' | 'edit'
}>(), {
  initial: null,
  mode: 'create',
})

const emit = defineEmits<{
  save: [participant: ParticipantInput]
}>()

function emptyForm(): ParticipantInput {
  return { name: '', birthDate: '', email: '', phone: '' }
}

const form = reactive<ParticipantInput>(props.initial ? {
  name: props.initial.name,
  birthDate: props.initial.birthDate,
  email: props.initial.email,
  phone: props.initial.phone,
} : emptyForm())
const touched = reactive<Record<ParticipantField, boolean>>({
  name: false,
  birthDate: false,
  email: false,
  phone: false,
})
const submitted = ref(false)
const errors = computed(() => validateParticipant(form, props.participants, props.initial?.id))

function visibleError(field: ParticipantField): string | undefined {
  return submitted.value || touched[field] ? errors.value[field] : undefined
}

function reset(): void {
  submitted.value = false
  for (const field of Object.keys(touched) as ParticipantField[]) touched[field] = false
  Object.assign(form, emptyForm())
}

function handleSubmit(): void {
  submitted.value = true
  if (Object.keys(errors.value).length > 0) return

  emit('save', {
    name: form.name.trim(),
    birthDate: form.birthDate,
    email: form.email.trim(),
    phone: form.phone.trim(),
  })

  if (props.mode === 'create') reset()
}
</script>

<template>
  <form
    class="participant-form"
    novalidate
    @submit.prevent="handleSubmit"
    @keydown.enter.prevent="handleSubmit"
  >
    <AppInput
      :id="`${mode}-name`"
      v-model="form.name"
      label="Name"
      placeholder="Enter user name"
      autocomplete="name"
      :error="visibleError('name')"
      @blur="touched.name = true"
    />
    <AppInput
      :id="`${mode}-birth-date`"
      v-model="form.birthDate"
      label="Date of Birth"
      type="date"
      :max="todayLocalDate()"
      :error="visibleError('birthDate')"
      @blur="touched.birthDate = true"
    />
    <AppInput
      :id="`${mode}-email`"
      v-model="form.email"
      label="Email"
      type="email"
      placeholder="Enter email"
      autocomplete="email"
      :error="visibleError('email')"
      @blur="touched.email = true"
    />
    <AppInput
      :id="`${mode}-phone`"
      v-model="form.phone"
      label="Phone number"
      type="tel"
      placeholder="+380XXXXXXXXX"
      autocomplete="tel"
      :error="visibleError('phone')"
      @blur="touched.phone = true"
    />
    <div class="participant-form__actions">
      <AppButton type="submit">
        {{ mode === 'edit' ? 'Оновити дані' : 'Save' }}
      </AppButton>
    </div>
  </form>
</template>

<style scoped lang="scss">
.participant-form__actions { display: flex; justify-content: flex-end; padding-top: 36px; }
</style>
