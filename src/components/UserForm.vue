<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/yup'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import AppButton from '@/components/AppButton.vue'
import type { CreateUserDto, User } from '@/types/user'

const props = withDefaults(defineProps<{
  initial?: User
  busy?: boolean
  serverError?: string
  submitLabel?: string
}>(), {
  initial: undefined,
  busy: false,
  serverError: '',
  submitLabel: 'Зберегти',
})
const emit = defineEmits<{ save: [input: CreateUserDto] }>()

const requiredText = 'Поле обов’язкове.'
const schema = toTypedSchema(yup.object({
  firstName: yup.string().trim().required(requiredText),
  lastName: yup.string().trim().required(requiredText),
  email: yup.string().trim().required(requiredText).email('Введіть коректний email.'),
  username: yup.string().trim().required(requiredText),
  password: yup.string().required(requiredText).min(6, 'Пароль має містити щонайменше 6 символів.'),
  age: yup.number().typeError('Введіть вік числом.').required(requiredText)
    .integer('Вік має бути цілим числом.').min(1, 'Вік має бути більшим за нуль.')
    .max(120, 'Введіть коректний вік.'),
  gender: yup.string().required(requiredText).oneOf(['male', 'female', 'other'], 'Оберіть стать.'),
  phone: yup.string().trim().required(requiredText),
}))

const { errors, defineField, handleSubmit } = useForm({
  validationSchema: schema,
  initialValues: {
    firstName: props.initial?.firstName ?? '',
    lastName: props.initial?.lastName ?? '',
    email: props.initial?.email ?? '',
    username: props.initial?.username ?? '',
    password: props.initial?.password ?? '',
    age: props.initial?.age,
    gender: props.initial?.gender ?? '',
    phone: props.initial?.phone ?? '',
  },
})

const [firstName, firstNameAttrs] = defineField('firstName')
const [lastName, lastNameAttrs] = defineField('lastName')
const [email, emailAttrs] = defineField('email')
const [username, usernameAttrs] = defineField('username')
const [password, passwordAttrs] = defineField('password')
const [age, ageAttrs] = defineField('age')
const [gender, genderAttrs] = defineField('gender')
const [phone, phoneAttrs] = defineField('phone')

const submit = handleSubmit((values) => emit('save', values))
</script>

<template>
  <form
    class="user-form"
    novalidate
    @submit="submit"
  >
    <div class="user-form__grid">
      <label>
        <span>Ім’я</span>
        <input
          v-model="firstName"
          v-bind="firstNameAttrs"
          class="form-control"
          type="text"
          autocomplete="given-name"
          :aria-invalid="Boolean(errors.firstName)"
        >
        <small v-if="errors.firstName">{{ errors.firstName }}</small>
      </label>
      <label>
        <span>Прізвище</span>
        <input
          v-model="lastName"
          v-bind="lastNameAttrs"
          class="form-control"
          type="text"
          autocomplete="family-name"
          :aria-invalid="Boolean(errors.lastName)"
        >
        <small v-if="errors.lastName">{{ errors.lastName }}</small>
      </label>
      <label>
        <span>Email</span>
        <input
          v-model="email"
          v-bind="emailAttrs"
          class="form-control"
          type="email"
          autocomplete="email"
          :aria-invalid="Boolean(errors.email)"
        >
        <small v-if="errors.email">{{ errors.email }}</small>
      </label>
      <label>
        <span>Username</span>
        <input
          v-model="username"
          v-bind="usernameAttrs"
          class="form-control"
          type="text"
          autocomplete="username"
          :aria-invalid="Boolean(errors.username)"
        >
        <small v-if="errors.username">{{ errors.username }}</small>
      </label>
      <label>
        <span>Пароль</span>
        <input
          v-model="password"
          v-bind="passwordAttrs"
          class="form-control"
          type="password"
          autocomplete="new-password"
          :aria-invalid="Boolean(errors.password)"
        >
        <small v-if="errors.password">{{ errors.password }}</small>
      </label>
      <label>
        <span>Вік</span>
        <input
          v-model.number="age"
          v-bind="ageAttrs"
          class="form-control"
          type="number"
          min="1"
          max="120"
          :aria-invalid="Boolean(errors.age)"
        >
        <small v-if="errors.age">{{ errors.age }}</small>
      </label>
      <label>
        <span>Стать</span>
        <select
          v-model="gender"
          v-bind="genderAttrs"
          class="form-select"
          :aria-invalid="Boolean(errors.gender)"
        >
          <option value="">Оберіть стать</option>
          <option value="female">Жіноча</option>
          <option value="male">Чоловіча</option>
          <option value="other">Інша</option>
        </select>
        <small v-if="errors.gender">{{ errors.gender }}</small>
      </label>
      <label>
        <span>Телефон</span>
        <input
          v-model="phone"
          v-bind="phoneAttrs"
          class="form-control"
          type="tel"
          autocomplete="tel"
          :aria-invalid="Boolean(errors.phone)"
        >
        <small v-if="errors.phone">{{ errors.phone }}</small>
      </label>
    </div>

    <p
      v-if="serverError"
      class="user-form__server-error"
      role="alert"
    >
      {{ serverError }}
    </p>
    <div class="user-form__actions">
      <AppButton
        type="submit"
        :disabled="busy"
      >
        {{ busy ? 'Збереження…' : submitLabel }}
      </AppButton>
    </div>
  </form>
</template>

<style scoped lang="scss">
.user-form__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
.user-form label { display: grid; align-content: start; gap: 6px; font-weight: 600; }
.user-form input, .user-form select { min-width: 0; font-weight: 400; }
.user-form small { color: #bd3434; font-size: 12px; font-weight: 400; }
.user-form [aria-invalid="true"] { border-color: #d9534f; }
.user-form__server-error { margin: 20px 0 0; color: #ad3434; }
.user-form__actions { display: flex; justify-content: flex-end; margin-top: 24px; }
@media (max-width: 580px) { .user-form__grid { grid-template-columns: 1fr; } }
</style>
