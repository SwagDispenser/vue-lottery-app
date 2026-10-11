import type { HttpClient } from '@/api/httpClient'
import type { AuthSession, AuthTokens, AuthUser, LoginDto } from '@/types/auth'

export class AuthService {
  constructor(private readonly http: HttpClient) {}

  login(credentials: LoginDto): Promise<AuthSession> {
    return this.http.request<AuthSession>('/auth/login', {
      method: 'POST',
      body: credentials,
    })
  }

  me(accessToken: string): Promise<AuthUser> {
    return this.http.request<AuthUser>('/auth/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  }

  refresh(refreshToken: string): Promise<AuthTokens> {
    return this.http.request<AuthTokens>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
    })
  }
}
