<script setup lang="ts">
import { computed, ref } from 'vue'
import { AppButton, AppTable, type AppTableColumn } from '@/shared/ui'
import SearchBar from './SearchBar.vue'
import type { Participant } from '@/entities/participant'

const props = defineProps<{ participants: Participant[] }>()
const emit = defineEmits<{
  edit: [participant: Participant]
  delete: [participant: Participant]
}>()

type SortKey = 'name' | 'birthDate'
const query = ref('')
const sortKey = ref<SortKey | null>(null)
const sortDirection = ref<1 | -1>(1)

function sortOrder(key: SortKey): 'ascending' | 'descending' | 'none' {
  if (sortKey.value !== key) return 'none'
  return sortDirection.value === 1 ? 'ascending' : 'descending'
}

const columns = computed<AppTableColumn<Participant>[]>(() => [
  { key: 'number', header: '#' },
  { key: 'name', header: 'Name', field: 'name', sortOrder: sortOrder('name') },
  { key: 'birthDate', header: 'Date of Birth', field: 'birthDate', sortOrder: sortOrder('birthDate') },
  { key: 'email', header: 'Email', field: 'email' },
  { key: 'phone', header: 'Phone number', field: 'phone' },
  { key: 'actions', header: 'Дії' },
])

const visibleParticipants = computed(() => {
  const filtered = props.participants.filter((participant) =>
    participant.name.toLocaleLowerCase().includes(query.value.toLocaleLowerCase()),
  )

  if (!sortKey.value) return filtered
  return [...filtered].sort((left, right) => {
    const comparison = sortKey.value === 'name'
      ? left.name.localeCompare(right.name, 'uk', { sensitivity: 'base' })
      : left.birthDate.localeCompare(right.birthDate)
    return comparison * sortDirection.value
  })
})

function sortBy(key: SortKey): void {
  if (sortKey.value === key) sortDirection.value = sortDirection.value === 1 ? -1 : 1
  else {
    sortKey.value = key
    sortDirection.value = 1
  }
}
</script>

<template>
  <section
    class="participants-panel panel"
    aria-label="Список учасників"
  >
    <div class="participants-panel__toolbar">
      <SearchBar @filter-by-name="query = $event" />
      <span class="participants-panel__count">Учасників: {{ participants.length }}</span>
    </div>
    <AppTable
      :rows="visibleParticipants"
      :columns="columns"
      row-key="id"
      label="Учасники лотереї"
      min-width="760px"
      :empty-message="participants.length === 0 ? 'Список учасників порожній.' : 'За вашим запитом учасників не знайдено.'"
    >
      <template #header-name>
        <AppButton
          variant="ghost"
          aria-label="Сортувати за іменем"
          @click="sortBy('name')"
        >
          Name <span aria-hidden="true">{{ sortKey === 'name' ? (sortDirection === 1 ? '↓' : '↑') : '↕' }}</span>
        </AppButton>
      </template>
      <template #header-birthDate>
        <AppButton
          variant="ghost"
          aria-label="Сортувати за датою народження"
          @click="sortBy('birthDate')"
        >
          Date of Birth <span aria-hidden="true">{{ sortKey === 'birthDate' ? (sortDirection === 1 ? '↓' : '↑') : '↕' }}</span>
        </AppButton>
      </template>
      <template #cell-number="{ index }">
        {{ index + 1 }}
      </template>
      <template #cell-actions="{ row }">
        <div class="participants-table__actions">
          <AppButton
            variant="ghost"
            :aria-label="`Редагувати дані ${row.name}`"
            @click="emit('edit', row)"
          >
            Редагувати дані
          </AppButton>
          <AppButton
            variant="ghost"
            :aria-label="`Видалити учасника ${row.name}`"
            @click="emit('delete', row)"
          >
            Видалити
          </AppButton>
        </div>
      </template>
    </AppTable>
  </section>
</template>

<style scoped lang="scss">
.participants-panel { padding: 20px; }
.participants-panel__toolbar { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 18px; }
.participants-panel__count { color: var(--app-subtle); font-size: 12px; }
.participants-table__actions { display: flex; gap: 4px; white-space: nowrap; }
</style>
