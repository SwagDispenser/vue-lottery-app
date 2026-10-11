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
  skipAuth?: boolean
}

interface AuthHandlers {
  getAccessToken: () => string | null
  refreshAccessToken: () => Promise<string | null>
  onUnauthorized: () => void
}

export class HttpClient {
  private authHandlers: AuthHandlers | null = null
  private refreshInFlight: Promise<string | null> | null = null

  constructor(private readonly baseUrl: string) {
    if (!baseUrl) throw new Error('VITE_API_URL не налаштовано. Перевірте файл .env.')
  }

  setAuthHandlers(handlers: AuthHandlers): void {
    this.authHandlers = handlers
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = new URL(path.replace(/^\//, ''), `${this.baseUrl.replace(/\/$/, '')}/`)
    if (options.query) url.search = options.query.toString()

    const send = (token: string | null): Promise<Response> => {
      const headers = new Headers(options.headers)
      if (options.body !== undefined) headers.set('Content-Type', 'application/json')
      if (token) headers.set('Authorization', `Bearer ${token}`)
      return fetch(url, {
        method: options.method ?? 'GET',
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: options.signal,
      })
    }

    const token = options.skipAuth ? null : (this.authHandlers?.getAccessToken() ?? null)
    let response = await send(token)

    if (response.status === 401 && token && !options.skipAuth && this.authHandlers) {
      try {
        const currentToken = this.authHandlers.getAccessToken()
        const refreshedToken = currentToken && currentToken !== token
          ? currentToken
          : await this.refreshTokenOnce()
        if (refreshedToken) response = await send(refreshedToken)
      } catch { /* Original 401 is reported below after clearing the session. */ }
      if (response.status === 401) this.authHandlers.onUnauthorized()
    }

    const data: unknown = await response.json().catch(() => null)
    if (!response.ok) {
      const message = typeof data === 'object' && data !== null && 'message' in data &&
        typeof data.message === 'string' ? data.message : `HTTP ${response.status}`
      throw new ApiError(message, response.status)
    }

    return data as T
  }

  private async refreshTokenOnce(): Promise<string | null> {
    if (!this.authHandlers) return null
    if (!this.refreshInFlight) {
      this.refreshInFlight = this.authHandlers.refreshAccessToken()
        .finally(() => { this.refreshInFlight = null })
    }
    return this.refreshInFlight
  }
}

export const httpClient = new HttpClient(import.meta.env.VITE_API_URL)
