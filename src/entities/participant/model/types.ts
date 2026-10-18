export interface ParticipantInput {
  name: string
  birthDate: string
  email: string
  phone: string
}

export interface Participant extends ParticipantInput {
  id: string
}
