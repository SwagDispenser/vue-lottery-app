export interface ListOptions {
  page: number
  limit: number
  query?: string
  signal?: AbortSignal
}

export interface Page<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

export interface Readable<T> {
  list(options: ListOptions): Promise<Page<T>>
  getById(id: number, signal?: AbortSignal): Promise<T>
}

export interface Creatable<T, TInput = Partial<T>> {
  create(input: TInput): Promise<T>
}

export interface Editable<T, TInput = Partial<T>> {
  update(id: number, input: TInput): Promise<T>
}

export interface Deletable<T> {
  delete(id: number): Promise<T>
}
