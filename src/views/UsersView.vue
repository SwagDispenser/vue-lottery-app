<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AppButton from '@/components/AppButton.vue'
import AppModal from '@/components/AppModal.vue'
import UserForm from '@/components/UserForm.vue'
import { userDirectory } from '@/stores/userDirectory'
import type { CreateUserDto, User } from '@/types/user'

const PAGE_SIZE = 10
const route = useRoute()
const router = useRouter()

function queryValue(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

const page = computed(() => {
  const value = Number(queryValue(route.query.page))
  return Number.isSafeInteger(value) && value > 0 ? value : 1
})
const query = computed(() => queryValue(route.query.q).trim())
const searchText = ref(query.value)
const users = ref<User[]>([])
const total = ref(0)
const loading = ref(false)
const error = ref('')
const createOpen = ref(false)
const creating = ref(false)
const createError = ref('')
const deletingUser = ref<User | null>(null)
const deleting = ref(false)
const deleteError = ref('')
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

watch([page, query, userDirectory.revision], async ([currentPage, currentQuery], _previous, onCleanup) => {
  const controller = new AbortController()
  onCleanup(() => controller.abort())
  loading.value = true
  error.value = ''

  try {
    const result = await userDirectory.list({
      page: currentPage,
      limit: PAGE_SIZE,
      query: currentQuery,
      signal: controller.signal,
    })
    if (controller.signal.aborted) return

    users.value = result.items
    total.value = result.total
    const lastPage = Math.max(1, Math.ceil(result.total / PAGE_SIZE))
    if (currentPage > lastPage) {
      void router.replace({
        name: 'users',
        query: { page: lastPage > 1 ? String(lastPage) : undefined, q: currentQuery || undefined },
      })
    }
  } catch (cause) {
    if (controller.signal.aborted) return
    users.value = []
    total.value = 0
    error.value = cause instanceof Error ? cause.message : 'Не вдалося завантажити користувачів.'
  } finally {
    if (!controller.signal.aborted) loading.value = false
  }
}, { immediate: true })

function goToPage(nextPage: number): void {
  if (nextPage < 1 || nextPage > pageCount.value || nextPage === page.value) return
  void router.push({
    name: 'users',
    query: { page: nextPage > 1 ? String(nextPage) : undefined, q: query.value || undefined },
  })
}

async function createUser(input: CreateUserDto): Promise<void> {
  if (creating.value) return
  creating.value = true
  createError.value = ''
  try {
    await userDirectory.create(input)
    createOpen.value = false
    if (page.value !== 1 || query.value) await router.push({ name: 'users' })
  } catch (cause) {
    createError.value = cause instanceof Error ? cause.message : 'Не вдалося створити користувача.'
  } finally {
    creating.value = false
  }
}

async function deleteUser(): Promise<void> {
  if (!deletingUser.value || deleting.value) return
  deleting.value = true
  deleteError.value = ''
  try {
    await userDirectory.remove(deletingUser.value.id)
    deletingUser.value = null
  } catch (cause) {
    deleteError.value = cause instanceof Error ? cause.message : 'Не вдалося видалити користувача.'
  } finally {
    deleting.value = false
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
        <AppButton @click="createOpen = true">
          Створити користувача
        </AppButton>
      </div>
    </div>

    <label class="users-view__search">
      <span>Пошук за іменем</span>
      <input
        v-model="searchText"
        class="form-control"
        type="search"
        placeholder="Введіть ім’я користувача"
      >
    </label>

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
                  <RouterLink :to="{ name: 'user-detail', params: { id: user.id }, query: route.query }">
                    Деталі
                  </RouterLink>
                  <RouterLink :to="{ name: 'user-edit', params: { id: user.id }, query: route.query }">
                    Редагувати
                  </RouterLink>
                  <button
                    type="button"
                    @click="deletingUser = user"
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
    @close="createOpen = false"
  >
    <UserForm
      :busy="creating"
      :server-error="createError"
      submit-label="Створити користувача"
      @save="createUser"
    />
  </AppModal>

  <AppModal
    v-if="deletingUser"
    title="Видалити користувача"
    @close="deletingUser = null"
  >
    <p>Видалити {{ deletingUser.firstName }} {{ deletingUser.lastName }} ({{ deletingUser.email }})?</p>
    <p
      v-if="deleteError"
      class="users-view__error"
      role="alert"
    >
      {{ deleteError }}
    </p>
    <div class="users-view__confirm-actions">
      <AppButton
        variant="secondary"
        @click="deletingUser = null"
      >
        Скасувати
      </AppButton>
      <AppButton
        variant="danger"
        :disabled="deleting"
        @click="deleteUser"
      >
        {{ deleting ? 'Видалення…' : 'Так, видалити' }}
      </AppButton>
    </div>
  </AppModal>
</template>

<style scoped lang="scss">
.users-view { padding: 30px 32px; }
.users-view__heading { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; }
.users-view__heading-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.users-view__eyebrow { margin: 0 0 6px; color: #008fad; font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
h1 { margin: 0 0 8px; font-size: 30px; font-weight: 700; }
.users-view__subtitle { margin: 0; color: #71828a; }
.users-view__count { padding: 7px 11px; border-radius: 3px; background: #eaf8fb; color: #087e99; white-space: nowrap; }
.users-view__search { display: grid; gap: 7px; width: min(100%, 350px); margin: 30px 0 24px; font-weight: 600; }
.users-view__search input { min-height: 38px; font-weight: 400; }
.users-view__state, .users-view__error { padding: 18px; border-radius: 4px; }
.users-view__state { background: #eef8fb; color: #477080; }
.users-view__error { border: 1px solid #f3c4c4; background: #fff4f4; color: #a43636; }
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
.users-view__confirm-actions { display: flex; justify-content: flex-end; gap: 9px; margin-top: 24px; }
.users-view__pagination { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-top: 22px; color: #65747b; }
.users-view__pagination-actions { display: flex; gap: 8px; }
@media (max-width: 620px) { .users-view { padding: 22px 18px; } .users-view__heading, .users-view__pagination { flex-wrap: wrap; } }
</style>
