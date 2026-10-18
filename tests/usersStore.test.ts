import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { ServiceProvider } from '../src/shared/api'
import { useUsersStore, type CreateUserDto, type User } from '../src/entities/user'

const original: User = {
  id: 1, firstName: 'Emily', lastName: 'Johnson', email: 'emily@example.test',
  username: 'emilys', password: 'password', age: 28, gender: 'female', phone: '+380671234567',
}
const input: CreateUserDto = { ...original, firstName: 'Local', username: 'local', email: 'local@example.test' }
const options = { page: 1, limit: 10 }

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => { resolve = done })
  return { promise, resolve }
}

function registerService() {
  const api = {
    list: vi.fn(async () => ({ items: [original], total: 1, page: 1, limit: 10 })),
    getById: vi.fn(async () => original),
    create: vi.fn(async (data: CreateUserDto) => ({ ...data, id: 209 })),
    update: vi.fn(async () => original),
    delete: vi.fn(async () => original),
  }
  ServiceProvider.register('users', () => api)
  return api
}

beforeEach(() => setActivePinia(createPinia()))

describe('useUsersStore', () => {
  it('updates the list and detail immediately and keeps simulated CRUD after refetch', async () => {
    const api = registerService()
    const store = useUsersStore()
    await store.fetchUsers(options)
    await store.fetchUser(1)
    await store.updateUser(1, { firstName: 'Updated' })
    expect(store.users[0]?.firstName).toBe('Updated')
    expect(store.selectedUser?.firstName).toBe('Updated')
    expect(api.list).toHaveBeenCalledTimes(1)
    await store.fetchUsers(options)
    expect(store.users[0]?.firstName).toBe('Updated')

    const created = await store.createUser(input)
    expect(store.users.map((user) => user.id)).toContain(created.id)
    expect(store.total).toBe(2)
    await store.removeUser(1)
    expect(store.users.map((user) => user.id)).toEqual([created.id])
    expect(store.selectedUser).toBeNull()
    await store.fetchUsers(options)
    expect(store.users.map((user) => user.id)).toEqual([created.id])
    expect(store.total).toBe(1)
    expect(api.delete).toHaveBeenCalledWith(1)
  })

  it('assigns unique local IDs and edits/deletes created users without unknown API IDs', async () => {
    const api = registerService()
    const store = useUsersStore()
    await store.fetchUsers(options)
    const first = await store.createUser(input)
    const second = await store.createUser(input)
    expect(first.id).not.toBe(second.id)
    expect(first.id).toBeLessThan(0)
    await store.updateUser(first.id, { firstName: 'Changed' })
    await store.fetchUser(first.id)
    expect(store.selectedUser?.firstName).toBe('Changed')
    await store.removeUser(first.id)
    expect(store.total).toBe(2)
    expect(api.update).not.toHaveBeenCalled()
    expect(api.delete).not.toHaveBeenCalled()
  })

  it('filters local changes along with remote search responses', async () => {
    registerService()
    const store = useUsersStore()
    await store.fetchUsers(options)
    await store.createUser(input)
    await store.fetchUsers({ ...options, query: 'Emily' })
    expect(store.users.map((user) => user.id)).toEqual([1])
    await store.updateUser(1, { firstName: 'Different', username: 'different', email: 'different@example.test' })
    expect(store.users).toEqual([])
    expect(store.total).toBe(0)
  })

  it('keeps successful data when a mutation fails and exposes the error', async () => {
    const api = registerService()
    api.delete.mockRejectedValueOnce(new Error('Delete failed'))
    const store = useUsersStore()
    await store.fetchUsers(options)
    await expect(store.removeUser(1)).rejects.toThrow('Delete failed')
    expect(store.users).toEqual([original])
    expect(store.total).toBe(1)
    expect(store.mutationError).toBe('Delete failed')
    expect(store.isSaving).toBe(false)
    api.list.mockRejectedValueOnce(new Error('List failed'))
    await store.fetchUsers(options)
    expect(store.error).toBe('List failed')
    expect(store.isLoading).toBe(false)
  })

  it('ignores stale list responses after a newer search', async () => {
    const api = registerService()
    const slow = deferred<{ items: User[]; total: number; page: number; limit: number }>()
    api.list.mockReturnValueOnce(slow.promise)
    const store = useUsersStore()
    const firstRequest = store.fetchUsers(options)
    await store.fetchUsers({ ...options, query: 'Emily' })
    slow.resolve({ items: [], total: 0, ...options })
    await firstRequest
    expect(store.users).toEqual([original])
    expect(store.searchQuery).toBe('Emily')
    expect(store.isLoading).toBe(false)
  })

  it('does not repopulate the store when requests complete after reset', async () => {
    const api = registerService()
    const slowList = deferred<{ items: User[]; total: number; page: number; limit: number }>()
    const slowCreate = deferred<User>()
    api.list.mockReturnValueOnce(slowList.promise)
    api.create.mockReturnValueOnce(slowCreate.promise)
    const store = useUsersStore()
    const listRequest = store.fetchUsers(options)
    const createRequest = store.createUser(input)
    expect(store.isSaving).toBe(true)
    store.reset()
    slowList.resolve({ items: [original], total: 1, ...options })
    slowCreate.resolve({ ...input, id: 209 })
    await listRequest
    await expect(createRequest).rejects.toThrow('Операцію скасовано')
    expect(store.users).toEqual([])
    expect(store.createdUsers).toEqual({})
    expect(store.total).toBe(0)
    expect(store.isSaving).toBe(false)
    expect(store.isLoading).toBe(false)
  })
})
