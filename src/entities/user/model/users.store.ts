import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { ServiceProvider, type ListOptions, type Page } from '@/shared/api'
import type { UserService } from '../api/user.service'
import type { CreateUserDto, UpdateUserDto, User } from './types'

function matchesSearch(user: User, query: string): boolean {
  const searchable = `${user.firstName} ${user.lastName} ${user.maidenName ?? ''} ${user.username} ${user.email}`
  return searchable.toLocaleLowerCase().includes(query.toLocaleLowerCase())
}

function message(cause: unknown): string {
  return cause instanceof Error ? cause.message : 'Не вдалося виконати запит користувачів.'
}

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([])
  const total = ref(0)
  const selectedUser = ref<User | null>(null)
  const isLoading = ref(false)
  const isLoadingUser = ref(false)
  const error = ref('')
  const userError = ref('')
  const mutationError = ref('')
  const pendingMutations = ref(0)
  const isSaving = computed(() => pendingMutations.value > 0)
  const hasUsers = computed(() => users.value.length > 0)

  // API імітує запис: ці дані накладаються на кожну отриману сторінку.
  const createdUsers = ref<Record<number, User>>({})
  const updatedUsers = ref<Record<number, User>>({})
  const deletedUsers = ref<Record<number, User>>({})
  const cachedUsers = ref<Record<number, User>>({})
  const remotePage = ref<Page<User> | null>(null)
  const searchQuery = ref('')
  const nextLocalId = ref(-1)
  let version = 0
  let listRequest = 0
  let detailRequest = 0

  function service(): UserService {
    return ServiceProvider.get<UserService>('users')
  }

  function applyLocalChanges(): void {
    const result = remotePage.value
    if (!result) return
    const query = searchQuery.value
    const remoteUsers = result.items
      .filter((user) => !deletedUsers.value[user.id])
      .map((user) => updatedUsers.value[user.id] ?? user)
      .filter((user) => !updatedUsers.value[user.id] || matchesSearch(user, query))
    const remoteIds = new Set(remoteUsers.map((user) => user.id))
    const newlyMatchingUsers = result.page === 1 && query
      ? Object.values(updatedUsers.value).filter((user) => {
        const original = cachedUsers.value[user.id]
        return original && !remoteIds.has(user.id) &&
          !matchesSearch(original, query) && matchesSearch(user, query)
      })
      : []
    const localUsers = result.page === 1
      ? Object.values(createdUsers.value).filter((user) => matchesSearch(user, query))
      : []
    const removedCount = Object.values(deletedUsers.value).filter((user) => matchesSearch(user, query)).length
    const createdCount = Object.values(createdUsers.value).filter((user) => matchesSearch(user, query)).length
    const updateAdjustment = Object.values(updatedUsers.value).reduce((count, user) => {
      const original = cachedUsers.value[user.id]
      if (!original) return count
      return count + Number(matchesSearch(user, query)) - Number(matchesSearch(original, query))
    }, 0)
    users.value = [...localUsers, ...newlyMatchingUsers, ...remoteUsers]
    total.value = Math.max(0, result.total + createdCount - removedCount + updateAdjustment)
  }

  async function fetchUsers(options: ListOptions): Promise<void> {
    const request = ++listRequest
    isLoading.value = true
    error.value = ''
    try {
      const result = await service().list(options)
      if (request !== listRequest || options.signal?.aborted) return
      for (const user of result.items) cachedUsers.value[user.id] = user
      remotePage.value = result
      searchQuery.value = options.query?.trim() ?? ''
      applyLocalChanges()
    } catch (cause) {
      if (request !== listRequest || options.signal?.aborted) return
      users.value = []
      total.value = 0
      remotePage.value = null
      error.value = message(cause)
    } finally {
      if (request === listRequest) isLoading.value = false
    }
  }

  async function readUser(id: number, signal?: AbortSignal): Promise<User> {
    if (!Number.isSafeInteger(id) || id === 0) throw new Error('Некоректний ідентифікатор користувача.')
    if (deletedUsers.value[id]) throw new Error('Користувача видалено.')
    const local = createdUsers.value[id] ?? updatedUsers.value[id] ?? cachedUsers.value[id]
    if (local) return local
    return service().getById(id, signal)
  }

  async function fetchUser(id: number, signal?: AbortSignal): Promise<void> {
    const request = ++detailRequest
    selectedUser.value = null
    isLoadingUser.value = true
    userError.value = ''
    try {
      const user = await readUser(id, signal)
      if (request !== detailRequest || signal?.aborted) return
      if (!createdUsers.value[id] && !updatedUsers.value[id]) cachedUsers.value[id] = user
      selectedUser.value = user
    } catch (cause) {
      if (request !== detailRequest || signal?.aborted) return
      userError.value = message(cause)
    } finally {
      if (request === detailRequest) isLoadingUser.value = false
    }
  }

  async function mutate<T>(operation: (currentVersion: number) => Promise<T>): Promise<T> {
    const currentVersion = version
    pendingMutations.value += 1
    mutationError.value = ''
    try {
      return await operation(currentVersion)
    } catch (cause) {
      if (currentVersion === version) mutationError.value = message(cause)
      throw cause
    } finally {
      if (currentVersion === version) pendingMutations.value -= 1
    }
  }

  function assertCurrent(currentVersion: number): void {
    if (currentVersion !== version) throw new Error('Операцію скасовано після завершення сесії.')
  }

  function createUser(input: CreateUserDto): Promise<User> {
    return mutate(async (currentVersion) => {
      const response = await service().create(input)
      assertCurrent(currentVersion)
      // DummyJSON повертає однаковий id для POST; локальні id завжди унікальні.
      const user = { ...input, ...response, id: nextLocalId.value-- }
      createdUsers.value[user.id] = user
      applyLocalChanges()
      return user
    })
  }

  function updateUser(id: number, input: UpdateUserDto): Promise<User> {
    return mutate(async (currentVersion) => {
      const current = await readUser(id)
      assertCurrent(currentVersion)
      const response = createdUsers.value[id] ? {} : await service().update(id, input)
      assertCurrent(currentVersion)
      const user = { ...current, ...response, ...input, id }
      if (createdUsers.value[id]) {
        createdUsers.value[id] = user
      } else {
        cachedUsers.value[id] ??= current
        updatedUsers.value[id] = user
      }
      if (selectedUser.value?.id === id) selectedUser.value = user
      applyLocalChanges()
      return user
    })
  }

  function removeUser(id: number): Promise<void> {
    return mutate(async (currentVersion) => {
      const current = await readUser(id)
      assertCurrent(currentVersion)
      if (createdUsers.value[id]) {
        delete createdUsers.value[id]
      } else {
        await service().delete(id)
        assertCurrent(currentVersion)
        deletedUsers.value[id] = cachedUsers.value[id] ?? current
        delete updatedUsers.value[id]
        delete cachedUsers.value[id]
      }
      if (selectedUser.value?.id === id) selectedUser.value = null
      applyLocalChanges()
    })
  }

  function clearMutationError(): void {
    mutationError.value = ''
  }

  function reset(): void {
    // Інвалідуємо незавершені запити, щоб вони не повернули дані після Logout.
    version += 1
    listRequest += 1
    detailRequest += 1
    users.value = []
    total.value = 0
    selectedUser.value = null
    isLoading.value = false
    isLoadingUser.value = false
    error.value = ''
    userError.value = ''
    mutationError.value = ''
    pendingMutations.value = 0
    createdUsers.value = {}
    updatedUsers.value = {}
    deletedUsers.value = {}
    cachedUsers.value = {}
    remotePage.value = null
    searchQuery.value = ''
    nextLocalId.value = -1
  }

  return {
    users, total, selectedUser, isLoading, isLoadingUser, error, userError, mutationError,
    pendingMutations, isSaving, hasUsers,
    createdUsers, updatedUsers, deletedUsers, cachedUsers, remotePage, searchQuery, nextLocalId,
    fetchUsers, fetchUser, createUser, updateUser, removeUser, clearMutationError, reset,
  }
})
