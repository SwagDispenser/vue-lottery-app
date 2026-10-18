<script setup lang="ts">
import { RouterLink, type LocationQuery } from 'vue-router'
import type { User } from '@/entities/user'

defineProps<{ users: User[]; query: LocationQuery }>()
const emit = defineEmits<{ delete: [user: User] }>()
</script>

<template>
  <div class="users-view__table-wrap">
    <table class="table users-view__table">
      <thead>
        <tr>
          <th scope="col">
            #
          </th>
          <th scope="col">
            Ім’я
          </th>
          <th scope="col">
            Username
          </th>
          <th scope="col">
            Email
          </th>
          <th scope="col">
            Телефон
          </th>
          <th scope="col">
            Вік
          </th>
          <th scope="col">
            Дії
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="user in users"
          :key="user.id"
        >
          <td>{{ user.id > 0 ? user.id : '—' }}</td>
          <td class="users-view__name">
            {{ user.firstName }} {{ user.lastName }}
          </td>
          <td>{{ user.username }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.phone }}</td>
          <td>{{ user.age }}</td>
          <td>
            <div class="users-view__row-actions">
              <RouterLink :to="{ name: 'user-detail', params: { id: user.id }, query }">
                Деталі
              </RouterLink>
              <RouterLink :to="{ name: 'user-edit', params: { id: user.id }, query }">
                Редагувати
              </RouterLink>
              <button
                type="button"
                @click="emit('delete', user)"
              >
                Видалити
              </button>
            </div>
          </td>
        </tr>
        <tr v-if="users.length === 0">
          <td
            class="users-view__empty"
            colspan="7"
          >
            За цим запитом користувачів не знайдено.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss">
.users-view__table-wrap { overflow-x: auto; }
.users-view__table { min-width: 940px; margin-bottom: 0; }
.users-view__table th { color: #48585f; white-space: nowrap; }
.users-view__table td { color: #65747b; vertical-align: middle; }
.users-view__table td.users-view__name { color: #27363d; font-weight: 600; white-space: nowrap; }
.users-view__empty { padding: 30px !important; text-align: center; }
.users-view__row-actions { display: flex; align-items: center; gap: 8px; }
.users-view__row-actions a, .users-view__row-actions button { padding: 4px 6px; border: 0; background: none; color: #008fad; font-size: 12px; font-weight: 600; text-decoration: none; white-space: nowrap; }
.users-view__row-actions button { color: #c13f3f; }
.users-view__row-actions a:hover, .users-view__row-actions button:hover { text-decoration: underline; }
</style>
