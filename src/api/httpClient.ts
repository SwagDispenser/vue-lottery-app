export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
    this.name = 'ApiError'
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  query?: URLSearchParams
  body?: unknown
  headers?: HeadersInit
  signal?: AbortSignal
}

export class HttpClient {
  constructor(private readonly baseUrl: string) {
    if (!baseUrl) throw new Error('VITE_API_URL не налаштовано. Перевірте файл .env.')
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = new URL(path.replace(/^\//, ''), `${this.baseUrl.replace(/\/$/, '')}/`)
    if (options.query) url.search = options.query.toString()

    const headers = new Headers(options.headers)
    if (options.body !== undefined) headers.set('Content-Type', 'application/json')

    const response = await fetch(url, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    })

    const data: unknown = await response.json().catch(() => null)
    if (!response.ok) {
      const message = typeof data === 'object' && data !== null && 'message' in data &&
        typeof data.message === 'string' ? data.message : `HTTP ${response.status}`
      throw new ApiError(message, response.status)
    }

    return data as T
  }
}

export const httpClient = new HttpClient(import.meta.env.VITE_API_URL)
