<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { toTypedSchema } from '@vee-validate/yup'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import { AppButton, AppInput, useNotification } from '@/shared/ui'
import { ApiError } from '@/shared/api'
import { useSessionStore } from '@/entities/session'

const route = useRoute()
const router = useRouter()
const auth = useSessionStore()
const notification = useNotification()
const { storageError } = storeToRefs(auth)
const loading = ref(false)
const loginError = ref('')

const { errors, defineField, handleSubmit } = useForm({
  validationSchema: toTypedSchema(yup.object({
    username: yup.string().trim().required('Введіть username.'),
    password: yup.string().required('Введіть пароль.')
      .min(6, 'Пароль має містити щонайменше 6 символів.'),
  })),
  initialValues: { username: '', password: '' },
})

const [username, usernameAttrs] = defineField('username')
const [password, passwordAttrs] = defineField('password')

const submit = handleSubmit(async (credentials) => {
  if (loading.value) return
  loading.value = true
  loginError.value = ''
  try {
    await auth.login(credentials)
    const requestedPath = route.query.redirect
    const destination = typeof requestedPath === 'string' && requestedPath.startsWith('/') &&
      !requestedPath.startsWith('//') ? requestedPath : '/users'
    await router.replace(destination)
  } catch (cause) {
    loginError.value = cause instanceof ApiError && [400, 401].includes(cause.status)
      ? 'Неправильний username або пароль.'
      : cause instanceof Error ? cause.message : 'Не вдалося увійти. Спробуйте ще раз.'
    notification.error(loginError.value)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="login-view">
    <p class="login-view__eyebrow">
      Доступ до Users
    </p>
    <h1>Login</h1>
    <p class="login-view__intro">
      Увійдіть, щоб працювати зі списком користувачів DummyJSON.
    </p>

    <form
      class="login-view__form"
      novalidate
      @submit="submit"
    >
      <AppInput
        id="login-username"
        v-model="username"
        v-bind="usernameAttrs"
        label="Username"
        autocomplete="username"
        :error="errors.username"
        :disabled="loading"
      />
      <AppInput
        id="login-password"
        v-model="password"
        v-bind="passwordAttrs"
        label="Пароль"
        type="password"
        autocomplete="current-password"
        :error="errors.password"
        :disabled="loading"
      />

      <p
        v-if="loginError || storageError"
        class="login-view__error"
        role="alert"
      >
        {{ loginError || storageError }}
      </p>
      <AppButton
        type="submit"
        :loading="loading"
      >
        {{ loading ? 'Вхід…' : 'Login' }}
      </AppButton>
    </form>

    <p class="login-view__hint">
      Тестовий акаунт: emilys / emilyspass
    </p>
  </section>
</template>

<style scoped lang="scss">
.login-view__eyebrow { margin: 0 0 7px; color: #008fad; font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
h1 { margin: 0 0 9px; font-size: 30px; font-weight: 700; }
.login-view__intro { margin: 0; color: #64757c; line-height: 1.6; }
.login-view__form { display: grid; gap: 18px; margin-top: 28px; }
.login-view__error { color: #bd3434; font-size: 12px; font-weight: 400; }
.login-view__form :deep(.app-field) { margin-bottom: 0; }
.login-view__form :deep(.app-button) { justify-self: end; min-width: 100px; }
.login-view__hint { margin: 24px 0 0; color: #829197; font-size: 12px; }
</style>
