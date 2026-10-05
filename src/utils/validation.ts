import type { Participant, ParticipantInput } from '@/types/participant'

export type ParticipantField = keyof ParticipantInput
export type ValidationErrors = Partial<Record<ParticipantField, string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^\+380\d{9}$/
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function isRealDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const parsed = new Date(Number(year), Number(month) - 1, Number(day))
  return parsed.getFullYear() === year && parsed.getMonth() + 1 === month && parsed.getDate() === day
}

export function todayLocalDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function normalizeEmail(email: string): string {
  return email.trim().toLocaleLowerCase()
}

export function validateParticipant(
  value: ParticipantInput,
  participants: Participant[],
  currentId?: string,
): ValidationErrors {
  const errors: ValidationErrors = {}
  const name = value.name.trim()
  const email = value.email.trim()
  const phone = value.phone.trim()

  if (!name) errors.name = 'Вкажіть ім’я учасника.'

  if (!value.birthDate) {
    errors.birthDate = 'Вкажіть дату народження.'
  } else if (!isRealDate(value.birthDate)) {
    errors.birthDate = 'Вкажіть коректну дату.'
  } else if (value.birthDate > todayLocalDate()) {
    errors.birthDate = 'Дата народження не може бути у майбутньому.'
  }

  if (!email) {
    errors.email = 'Вкажіть електронну пошту.'
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Вкажіть коректну електронну пошту.'
  } else if (
    participants.some(
      (participant) => participant.id !== currentId && normalizeEmail(participant.email) === normalizeEmail(email),
    )
  ) {
    errors.email = 'Учасник із такою електронною поштою вже існує.'
  }

  if (!phone) {
    errors.phone = 'Вкажіть номер телефону.'
  } else if (!PHONE_PATTERN.test(phone)) {
    errors.phone = 'Формат телефону: +380XXXXXXXXX.'
  }

  return errors
}
