<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { AppButton, AppInput, AppModal, AppConfirmDialog, useNotification } from '@/shared/ui'
import { UserForm } from '@/features/user-form'
import { UsersTable } from '@/widgets/users-table'
import { useUsersStore } from '@/entities/user'
import type { CreateUserDto, User } from '@/entities/user'

const PAGE_SIZE = 10
const route = useRoute()
const router = useRouter()
const store = useUsersStore()
const notification = useNotification()
const { users, total, isLoading: loading, error, isSaving: saving, mutationError } = storeToRefs(store)

function queryValue(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

const page = computed(() => {
  const value = Number(queryValue(route.query.page))
  return Number.isSafeInteger(value) && value > 0 ? value : 1
})
const query = computed(() => queryValue(route.query.q).trim())
const searchText = ref(query.value)
const createOpen = ref(false)
const deletingUser = ref<User | null>(null)
const pageCount = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))

watch(query, (value) => {
  searchText.value = value
})

watch(searchText, (value, _previous, onCleanup) => {
  const nextQuery = value.trim()
  if (nextQuery === query.value) return

  const timer = window.setTimeout(() => {
    void router.replace({
      name: 'users',
      query: { q: nextQuery || undefined },
    })
  }, 300)
  onCleanup(() => window.clearTimeout(timer))
})

watch([page, query], async ([currentPage, currentQuery], _previous, onCleanup) => {
  const controller = new AbortController()
  onCleanup(() => controller.abort())
  await store.fetchUsers({
    page: currentPage,
    limit: PAGE_SIZE,
    query: currentQuery,
    signal: controller.signal,
  })
}, { immediate: true })

// Після видалення останнього запису сторінки повертаємося на доступну сторінку.
watch([pageCount, loading], ([lastPage, busy]) => {
  if (!busy && !error.value && page.value > lastPage) {
    void router.replace({
      name: 'users',
      query: { page: lastPage > 1 ? String(lastPage) : undefined, q: query.value || undefined },
    })
  }
})

function goToPage(nextPage: number): void {
  if (nextPage < 1 || nextPage > pageCount.value || nextPage === page.value) return
  void router.push({
    name: 'users',
    query: { page: nextPage > 1 ? String(nextPage) : undefined, q: query.value || undefined },
  })
}

function openCreate(): void {
  store.clearMutationError()
  createOpen.value = true
}

function confirmRemoval(user: User): void {
  store.clearMutationError()
  deletingUser.value = user
}

async function createUser(input: CreateUserDto): Promise<void> {
  if (saving.value) return
  try {
    await store.createUser(input)
    notification.success('Користувача створено.')
    createOpen.value = false
    if (page.value !== 1 || query.value) await router.push({ name: 'users' })
  } catch {
    notification.error(store.mutationError || 'Не вдалося створити користувача.')
  }
}

async function deleteUser(): Promise<void> {
  if (!deletingUser.value || saving.value) return
  try {
    await store.removeUser(deletingUser.value.id)
    notification.success('Користувача видалено.')
    deletingUser.value = null
  } catch {
    notification.error(store.mutationError || 'Не вдалося видалити користувача.')
  }
}
</script>

<template>
  <main class="users-view panel">
    <div class="users-view__heading">
      <div>
        <p class="users-view__eyebrow">
          DummyJSON Users
        </p>
        <h1>Користувачі</h1>
        <p class="users-view__subtitle">
          Пошук і сторінка списку зберігаються в адресі браузера.
        </p>
      </div>
      <div class="users-view__heading-actions">
        <span class="users-view__count">Усього: {{ total }}</span>
        <AppButton @click="openCreate">
          Створити користувача
        </AppButton>
      </div>
    </div>

    <div class="users-view__search">
      <AppInput
        id="users-search"
        v-model="searchText"
        label="Пошук за іменем"
        type="search"
        placeholder="Введіть ім’я користувача"
        :required="false"
      />
    </div>

    <p
      v-if="error"
      class="users-view__error"
      role="alert"
    >
      {{ error }}
    </p>
    <p
      v-else-if="loading"
      class="users-view__state"
      role="status"
    >
      Завантаження користувачів…
    </p>
    <template v-else>
      <UsersTable
        :users="users"
        :query="route.query"
        @delete="confirmRemoval"
      />

      <div class="users-view__pagination">
        <span>Сторінка {{ page }} із {{ pageCount }}</span>
        <div class="users-view__pagination-actions">
          <AppButton
            variant="secondary"
            :disabled="page <= 1"
            @click="goToPage(page - 1)"
          >
            Назад
          </AppButton>
          <AppButton
            variant="secondary"
            :disabled="page >= pageCount"
            @click="goToPage(page + 1)"
          >
            Далі
          </AppButton>
        </div>
      </div>
    </template>
  </main>

  <AppModal
    v-if="createOpen"
    title="Створити користувача"
    :busy="saving"
    @close="createOpen = false"
  >
    <UserForm
      :busy="saving"
      :server-error="mutationError"
      submit-label="Створити користувача"
      @save="createUser"
    />
  </AppModal>

  <AppConfirmDialog
    v-if="deletingUser"
    :open="true"
    title="Видалити користувача"
    :message="`Видалити ${deletingUser.firstName} ${deletingUser.lastName} (${deletingUser.email})?`"
    :busy="saving"
    :error="mutationError"
    @confirm="deleteUser"
    @close="deletingUser = null"
  />
</template>

<style scoped lang="scss">
.users-view { padding: 30px 32px; }
.users-view__heading { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; }
.users-view__heading-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.users-view__eyebrow { margin: 0 0 6px; color: var(--app-accent); font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
h1 { margin: 0 0 8px; font-size: 30px; font-weight: 700; }
.users-view__subtitle { margin: 0; color: var(--app-muted); }
.users-view__count { padding: 7px 11px; border-radius: 3px; background: var(--app-tint); color: var(--app-accent); white-space: nowrap; }
.users-view__search { display: grid; gap: 7px; width: min(100%, 350px); margin: 30px 0 24px; font-weight: 600; }
.users-view__search :deep(.app-field) { margin-bottom: 0; }
.users-view__state, .users-view__error { padding: 18px; border-radius: 4px; }
.users-view__state { background: var(--app-tint); color: var(--app-muted); }
.users-view__error { border: 1px solid var(--app-error-border); background: var(--app-error-bg); color: var(--app-error-text); }
.users-view__pagination { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-top: 22px; color: var(--app-muted); }
.users-view__pagination-actions { display: flex; gap: 8px; }
@media (max-width: 620px) { .users-view { padding: 22px 18px; } .users-view__heading, .users-view__pagination { flex-wrap: wrap; } }
</style>
