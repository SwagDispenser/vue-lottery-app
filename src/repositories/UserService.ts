import type { HttpClient } from '@/api/httpClient'
import type { CreateUserDto, UpdateUserDto, User } from '@/types/user'
import type { Creatable, Deletable, Editable, ListOptions, Page, Readable } from './contracts'

interface UsersResponse {
  users: User[]
  total: number
  skip: number
  limit: number
}

export class UserService implements
  Readable<User>,
  Creatable<User, CreateUserDto>,
  Editable<User, UpdateUserDto>,
  Deletable<User> {
  constructor(private readonly http: HttpClient) {}

  async list({ page, limit, query = '', signal }: ListOptions): Promise<Page<User>> {
    const params = new URLSearchParams({
      limit: String(limit),
      skip: String((page - 1) * limit),
    })
    const search = query.trim()
    if (search) params.set('q', search)

    const data = await this.http.request<UsersResponse>(
      search ? '/users/search' : '/users',
      { query: params, signal },
    )

    return { items: data.users, total: data.total, page, limit }
  }

  getById(id: number, signal?: AbortSignal): Promise<User> {
    return this.http.request<User>(`/users/${id}`, { signal })
  }

  create(input: CreateUserDto): Promise<User> {
    return this.http.request<User>('/users/add', { method: 'POST', body: input })
  }

  update(id: number, input: UpdateUserDto): Promise<User> {
    return this.http.request<User>(`/users/${id}`, { method: 'PUT', body: input })
  }

  delete(id: number): Promise<User> {
    return this.http.request<User>(`/users/${id}`, { method: 'DELETE' })
  }
}
