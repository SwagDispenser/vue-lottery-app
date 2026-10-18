<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { userDirectory } from '@/entities/user'
import type { User } from '@/entities/user'

const props = defineProps<{ id: string }>()
const route = useRoute()
const user = ref<User | null>(null)
const loading = ref(false)
const error = ref('')

watch([() => props.id, userDirectory.revision], async ([rawId], _previous, onCleanup) => {
  const id = Number(rawId)
  if (!Number.isSafeInteger(id) || id === 0) {
    user.value = null
    loading.value = false
    error.value = 'Некоректний ідентифікатор користувача.'
    return
  }

  const controller = new AbortController()
  onCleanup(() => controller.abort())
  loading.value = true
  error.value = ''
  try {
    const result = await userDirectory.getById(id, controller.signal)
    if (!controller.signal.aborted) user.value = result
  } catch (cause) {
    if (controller.signal.aborted) return
    user.value = null
    error.value = cause instanceof Error ? cause.message : 'Не вдалося завантажити користувача.'
  } finally {
    if (!controller.signal.aborted) loading.value = false
  }
}, { immediate: true })
</script>

<template>
  <main class="user-detail panel">
    <RouterLink
      class="user-detail__back"
      :to="{ name: 'users', query: route.query }"
    >
      ← До списку
    </RouterLink>

    <p
      v-if="loading"
      role="status"
    >
      Завантаження користувача…
    </p>
    <p
      v-else-if="error"
      class="user-detail__error"
      role="alert"
    >
      {{ error }}
    </p>
    <template v-else-if="user">
      <div class="user-detail__heading">
        <img
          v-if="user.image"
          :src="user.image"
          :alt="`Фото ${user.firstName} ${user.lastName}`"
          width="76"
          height="76"
        >
        <div>
          <p class="user-detail__eyebrow">
            {{ user.id > 0 ? `Користувач #${user.id}` : 'Локально створений користувач' }}
          </p>
          <h1>{{ user.firstName }} {{ user.lastName }}</h1>
          <p>@{{ user.username }}</p>
        </div>
      </div>

      <dl class="user-detail__facts">
        <div><dt>Email</dt><dd>{{ user.email }}</dd></div>
        <div><dt>Телефон</dt><dd>{{ user.phone }}</dd></div>
        <div><dt>Вік</dt><dd>{{ user.age }}</dd></div>
        <div><dt>Стать</dt><dd>{{ user.gender }}</dd></div>
        <div v-if="user.birthDate">
          <dt>Дата народження</dt><dd>{{ user.birthDate }}</dd>
        </div>
        <div v-if="user.role">
          <dt>Роль</dt><dd>{{ user.role }}</dd>
        </div>
        <div v-if="user.maidenName">
          <dt>Дівоче прізвище</dt><dd>{{ user.maidenName }}</dd>
        </div>
        <div v-if="user.bloodGroup">
          <dt>Група крові</dt><dd>{{ user.bloodGroup }}</dd>
        </div>
        <div v-if="user.height">
          <dt>Зріст</dt><dd>{{ user.height }} см</dd>
        </div>
        <div v-if="user.weight">
          <dt>Вага</dt><dd>{{ user.weight }} кг</dd>
        </div>
        <div v-if="user.eyeColor">
          <dt>Колір очей</dt><dd>{{ user.eyeColor }}</dd>
        </div>
        <div v-if="user.hair?.color">
          <dt>Волосся</dt><dd>{{ user.hair.color }}, {{ user.hair.type }}</dd>
        </div>
        <div v-if="user.university">
          <dt>Університет</dt><dd>{{ user.university }}</dd>
        </div>
        <div v-if="user.address?.address">
          <dt>Адреса</dt>
          <dd>
            {{ user.address.address }}, {{ user.address.city }}, {{ user.address.state }},
            {{ user.address.postalCode }}, {{ user.address.country }}
          </dd>
        </div>
        <div v-if="user.company?.name">
          <dt>Компанія</dt>
          <dd>{{ user.company.name }} — {{ user.company.title }} ({{ user.company.department }})</dd>
        </div>
      </dl>

      <RouterLink
        v-if="route.name !== 'user-edit'"
        class="user-detail__edit"
        :to="{ name: 'user-edit', params: { id: user.id }, query: route.query }"
      >
        Редагувати дані
      </RouterLink>
      <RouterView />
    </template>
  </main>
</template>

<style scoped lang="scss">
.user-detail { max-width: 850px; padding: 30px 32px; }
.user-detail__back { color: #008fad; font-weight: 600; text-decoration: none; }
.user-detail__heading { display: flex; align-items: center; gap: 20px; margin: 24px 0; }
.user-detail__heading img { border-radius: 50%; background: #eaf8fb; object-fit: cover; }
.user-detail__eyebrow { margin: 0 0 5px; color: #008fad; font-size: 12px; font-weight: 700; text-transform: uppercase; }
h1 { margin: 0 0 5px; font-size: 30px; }
.user-detail__heading p:last-child { margin: 0; color: #7b8b91; }
.user-detail__facts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; margin: 0 0 26px; }
.user-detail__facts div { padding: 16px; border: 1px solid #e8edef; border-radius: 4px; }
.user-detail__facts dt { margin-bottom: 5px; color: #809096; font-size: 12px; text-transform: uppercase; }
.user-detail__facts dd { margin: 0; overflow-wrap: anywhere; font-weight: 600; }
.user-detail__error { color: #b03b3b; }
.user-detail__edit { display: inline-block; padding: 9px 15px; border-radius: 3px; background: #00acd2; color: #fff; font-weight: 600; text-decoration: none; }
@media (max-width: 620px) { .user-detail { padding: 22px 18px; } .user-detail__facts { grid-template-columns: 1fr; } }
</style>
