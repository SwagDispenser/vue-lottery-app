<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toTypedSchema } from '@vee-validate/yup'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import { AppButton } from '@/shared/ui'
import { ApiError } from '@/shared/api'
import { useAuthStore } from '@/entities/session'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
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
          autocomplete="current-password"
          :aria-invalid="Boolean(errors.password)"
        >
        <small v-if="errors.password">{{ errors.password }}</small>
      </label>

      <p
        v-if="loginError || auth.storageError"
        class="login-view__error"
        role="alert"
      >
        {{ loginError || auth.storageError }}
      </p>
      <AppButton
        type="submit"
        :disabled="loading"
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
.login-view__form label { display: grid; gap: 7px; font-weight: 600; }
.login-view__form input { min-height: 40px; font-weight: 400; }
.login-view__form small, .login-view__error { color: #bd3434; font-size: 12px; font-weight: 400; }
.login-view__form [aria-invalid="true"] { border-color: #d9534f; }
.login-view__form button { justify-self: end; min-width: 100px; }
.login-view__hint { margin: 24px 0 0; color: #829197; font-size: 12px; }
</style>
