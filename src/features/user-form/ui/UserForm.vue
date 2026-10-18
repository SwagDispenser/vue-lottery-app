<script setup lang="ts">
import { useId } from 'vue'
import { toTypedSchema } from '@vee-validate/yup'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import { AppButton, AppInput } from '@/shared/ui'
import type { CreateUserDto, User } from '@/entities/user'

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
const formId = useId()

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
      <AppInput
        :id="`${formId}-firstName`"
        v-model="firstName"
        v-bind="firstNameAttrs"
        label="Ім’я"
        type="text"
        autocomplete="given-name"
        :error="errors.firstName"
        :disabled="busy"
      />
      <AppInput
        :id="`${formId}-lastName`"
        v-model="lastName"
        v-bind="lastNameAttrs"
        label="Прізвище"
        type="text"
        autocomplete="family-name"
        :error="errors.lastName"
        :disabled="busy"
      />
      <AppInput
        :id="`${formId}-email`"
        v-model="email"
        v-bind="emailAttrs"
        label="Email"
        type="email"
        autocomplete="email"
        :error="errors.email"
        :disabled="busy"
      />
      <AppInput
        :id="`${formId}-username`"
        v-model="username"
        v-bind="usernameAttrs"
        label="Username"
        type="text"
        autocomplete="username"
        :error="errors.username"
        :disabled="busy"
      />
      <AppInput
        :id="`${formId}-password`"
        v-model="password"
        v-bind="passwordAttrs"
        label="Пароль"
        type="password"
        autocomplete="new-password"
        :error="errors.password"
        :disabled="busy"
      />
      <AppInput
        :id="`${formId}-age`"
        v-model="age"
        v-bind="ageAttrs"
        label="Вік"
        type="number"
        autocomplete="off"
        :error="errors.age"
        :disabled="busy"
        :min="1"
        :max="120"
      />
      <div class="user-form__select-field">
        <label :for="`${formId}-gender`">Стать</label>
        <select
          :id="`${formId}-gender`"
          v-model="gender"
          v-bind="genderAttrs"
          :disabled="busy"
          :aria-invalid="Boolean(errors.gender)"
          :aria-describedby="errors.gender ? `${formId}-gender-error` : undefined"
          required
        >
          <option value="">
            Оберіть стать
          </option>
          <option value="female">
            Жіноча
          </option>
          <option value="male">
            Чоловіча
          </option>
          <option value="other">
            Інша
          </option>
        </select>
        <small
          v-if="errors.gender"
          :id="`${formId}-gender-error`"
          aria-live="polite"
        >{{ errors.gender }}</small>
      </div>
      <AppInput
        :id="`${formId}-phone`"
        v-model="phone"
        v-bind="phoneAttrs"
        label="Телефон"
        type="tel"
        autocomplete="tel"
        :error="errors.phone"
        :disabled="busy"
      />
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
        :loading="busy"
      >
        {{ busy ? 'Збереження…' : submitLabel }}
      </AppButton>
    </div>
  </form>
</template>

<style scoped lang="scss">
.user-form__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
.user-form :deep(.app-field) { margin-bottom: 0; }
.user-form__select-field { display: grid; align-content: start; gap: 4px; }
.user-form__select-field label { font-weight: 600; }
.user-form__select-field select {
  width: 100%; min-height: 38px; padding: .5rem .75rem;
  border: 1px solid var(--p-form-field-border-color, #cbd5e1); border-radius: 3px;
  background: var(--p-form-field-background, #fff); color: var(--p-form-field-color, #253238);
  font: inherit;
}
.user-form__select-field select:focus { outline: 2px solid var(--p-primary-color, #0088a6); outline-offset: 1px; }
.user-form__select-field [aria-invalid="true"] { border-color: var(--p-red-600, #bd3434); }
.user-form__select-field small { color: var(--p-red-600, #bd3434); font-size: 12px; }
.user-form__server-error { margin: 20px 0 0; color: #ad3434; }
.user-form__actions { display: flex; justify-content: flex-end; margin-top: 24px; }
@media (max-width: 580px) { .user-form__grid { grid-template-columns: 1fr; } }
</style>
