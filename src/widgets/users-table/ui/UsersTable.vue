<script setup lang="ts">
import { RouterLink, type LocationQuery } from 'vue-router'
import { AppButton, AppTable, type AppTableColumn } from '@/shared/ui'
import type { User } from '@/entities/user'

defineProps<{ users: User[]; query: LocationQuery }>()
const emit = defineEmits<{ delete: [user: User] }>()
const columns: AppTableColumn<User>[] = [
  { key: 'id', header: '#', field: 'id' },
  { key: 'name', header: 'Ім’я' },
  { key: 'username', header: 'Username', field: 'username' },
  { key: 'email', header: 'Email', field: 'email' },
  { key: 'phone', header: 'Телефон', field: 'phone' },
  { key: 'age', header: 'Вік', field: 'age' },
  { key: 'actions', header: 'Дії' },
]
</script>

<template>
  <AppTable
    :rows="users"
    :columns="columns"
    row-key="id"
    label="Користувачі DummyJSON"
    min-width="940px"
    empty-message="За цим запитом користувачів не знайдено."
  >
    <template #cell-id="{ row }">
      {{ row.id > 0 ? row.id : '—' }}
    </template>
    <template #cell-name="{ row }">
      <strong class="users-table__name">{{ row.firstName }} {{ row.lastName }}</strong>
    </template>
    <template #cell-actions="{ row }">
      <div class="users-table__actions">
        <RouterLink :to="{ name: 'user-detail', params: { id: row.id }, query }">
          Деталі
        </RouterLink>
        <RouterLink :to="{ name: 'user-edit', params: { id: row.id }, query }">
          Редагувати
        </RouterLink>
        <AppButton
          variant="ghost"
          class="users-table__delete"
          @click="emit('delete', row)"
        >
          Видалити
        </AppButton>
      </div>
    </template>
  </AppTable>
</template>

<style scoped lang="scss">
.users-table__name { white-space: nowrap; }
.users-table__actions { display: flex; align-items: center; gap: 8px; }
.users-table__actions a { padding: 5px 8px; color: var(--p-primary-color, #0088a6); font-size: 12px; font-weight: 600; text-decoration: none; white-space: nowrap; }
.users-table__actions a:hover { text-decoration: underline; }
.users-table__delete { color: var(--p-red-600, #c13f3f); font-size: 12px; }
</style>
