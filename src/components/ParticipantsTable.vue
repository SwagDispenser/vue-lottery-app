<script setup lang="ts">
import { computed, ref } from 'vue'
import AppButton from './AppButton.vue'
import SearchBar from './SearchBar.vue'
import type { Participant } from '@/types/participant'

const props = defineProps<{ participants: Participant[] }>()
const emit = defineEmits<{
  edit: [participant: Participant]
  delete: [participant: Participant]
}>()

type SortKey = 'name' | 'birthDate'
const query = ref('')
const sortKey = ref<SortKey | null>(null)
const sortDirection = ref<1 | -1>(1)

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
    <div class="table-responsive">
      <table class="table participants-table">
        <thead>
          <tr>
            <th scope="col">
              #
            </th>
            <th scope="col">
              <button
                class="sort-button"
                type="button"
                :aria-label="'Сортувати за іменем'"
                @click="sortBy('name')"
              >
                Name <span aria-hidden="true">{{ sortKey === 'name' ? (sortDirection === 1 ? '↓' : '↑') : '↕' }}</span>
              </button>
            </th>
            <th scope="col">
              <button
                class="sort-button"
                type="button"
                :aria-label="'Сортувати за датою народження'"
                @click="sortBy('birthDate')"
              >
                Date of Birth <span aria-hidden="true">{{ sortKey === 'birthDate' ? (sortDirection === 1 ? '↓' : '↑') : '↕' }}</span>
              </button>
            </th>
            <th scope="col">
              Email
            </th>
            <th scope="col">
              Phone number
            </th>
            <th scope="col">
              Дії
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(participant, index) in visibleParticipants"
            :key="participant.id"
          >
            <td>{{ index + 1 }}</td>
            <td>{{ participant.name }}</td>
            <td>{{ participant.birthDate }}</td>
            <td>{{ participant.email }}</td>
            <td>{{ participant.phone }}</td>
            <td class="participants-table__actions">
              <AppButton
                variant="ghost"
                :aria-label="`Редагувати дані ${participant.name}`"
                @click="emit('edit', participant)"
              >
                Редагувати дані
              </AppButton>
              <AppButton
                variant="ghost"
                :aria-label="`Видалити учасника ${participant.name}`"
                @click="emit('delete', participant)"
              >
                Видалити
              </AppButton>
            </td>
          </tr>
          <tr v-if="visibleParticipants.length === 0">
            <td
              colspan="6"
              class="participants-table__empty"
            >
              {{ participants.length === 0 ? 'Список учасників порожній.' : 'За вашим запитом учасників не знайдено.' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped lang="scss">
.participants-panel { padding: 20px; }
.participants-panel__toolbar { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 18px; }
.participants-panel__count { color: #95a2a8; font-size: 12px; }
.participants-table { margin: 0; min-width: 760px; font-size: 13px; }
.participants-table th { white-space: nowrap; color: #48545a; font-weight: 700; border-bottom: 1px solid #e9ecee; }
.participants-table td { color: #858d91; vertical-align: middle; border-bottom-color: #f0f0f0; }
.participants-table tbody tr:last-child td { border-bottom: 0; }
.participants-table__actions { white-space: nowrap; }
.participants-table__empty { text-align: center; padding: 22px; }
.sort-button { border: 0; padding: 0; background: transparent; color: inherit; font: inherit; font-weight: 700; }
.sort-button span { margin-left: 4px; color: #00acd2; font-size: 15px; }
.sort-button:hover { color: #008eae; }
</style>
