import { ref } from 'vue'
import { ServiceProvider, type ListOptions, type Page } from '@/shared/api'
import type { UserService } from '../api/user.service'
import type { CreateUserDto, UpdateUserDto, User } from './types'

const createdUsers = new Map<number, User>()
const updatedUsers = new Map<number, User>()
const deletedUsers = new Map<number, User>()
const cachedUsers = new Map<number, User>()
const revision = ref(0)
let nextLocalId = -1

function service(): UserService {
  return ServiceProvider.get<UserService>('users')
}

function matchesSearch(user: User, query: string): boolean {
  if (!query) return true
  const searchable = `${user.firstName} ${user.lastName} ${user.maidenName ?? ''} ${user.username} ${user.email}`
  return searchable.toLocaleLowerCase().includes(query.toLocaleLowerCase())
}

async function list(options: ListOptions): Promise<Page<User>> {
  const result = await service().list(options)
  for (const user of result.items) cachedUsers.set(user.id, user)

  const query = options.query?.trim() ?? ''
  const remoteUsers = result.items
    .filter((user) => !deletedUsers.has(user.id))
    .map((user) => updatedUsers.get(user.id) ?? user)
    .filter((user) => !updatedUsers.has(user.id) || matchesSearch(user, query))
  const newlyMatchingUsers = options.page === 1 && query
    ? [...updatedUsers.values()].filter((user) => {
      const original = cachedUsers.get(user.id)
      return original && !matchesSearch(original, query) && matchesSearch(user, query)
    })
    : []
  const localUsers = options.page === 1
    ? [...createdUsers.values()].filter((user) => matchesSearch(user, query))
    : []

  const removedCount = [...deletedUsers.values()].filter((user) => matchesSearch(user, query)).length
  const createdCount = [...createdUsers.values()].filter((user) => matchesSearch(user, query)).length
  const updateAdjustment = [...updatedUsers.values()].reduce((count, user) => {
    const original = cachedUsers.get(user.id)
    if (!original) return count
    return count + Number(matchesSearch(user, query)) - Number(matchesSearch(original, query))
  }, 0)

  return {
    ...result,
    items: [...localUsers, ...newlyMatchingUsers, ...remoteUsers],
    total: Math.max(0, result.total + createdCount - removedCount + updateAdjustment),
  }
}

async function getById(id: number, signal?: AbortSignal): Promise<User> {
  if (deletedUsers.has(id)) throw new Error('Користувача видалено.')
  const local = createdUsers.get(id) ?? updatedUsers.get(id) ?? cachedUsers.get(id)
  if (local) return local

  const user = await service().getById(id, signal)
  cachedUsers.set(id, user)
  return user
}

async function create(input: CreateUserDto): Promise<User> {
  const response = await service().create(input)
  // DummyJSON повертає один і той самий id для кожного POST; локальні id мають бути унікальними.
  const user = { ...input, ...response, id: nextLocalId-- }
  createdUsers.set(user.id, user)
  revision.value += 1
  return user
}

async function update(id: number, input: UpdateUserDto): Promise<User> {
  const current = await getById(id)
  if (createdUsers.has(id)) {
    const user = { ...current, ...input }
    createdUsers.set(id, user)
    revision.value += 1
    return user
  }

  const response = await service().update(id, input)
  const user = { ...current, ...response, ...input, id }
  updatedUsers.set(id, user)
  revision.value += 1
  return user
}

async function remove(id: number): Promise<void> {
  const current = await getById(id)
  if (createdUsers.has(id)) {
    createdUsers.delete(id)
  } else {
    await service().delete(id)
    deletedUsers.set(id, cachedUsers.get(id) ?? current)
    updatedUsers.delete(id)
    cachedUsers.delete(id)
  }
  revision.value += 1
}

function reset(): void {
  createdUsers.clear()
  updatedUsers.clear()
  deletedUsers.clear()
  cachedUsers.clear()
  nextLocalId = -1
  revision.value += 1
}

export const userDirectory = { revision, list, getById, create, update, remove, reset }
