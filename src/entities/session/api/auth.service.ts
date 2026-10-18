import type { HttpClient } from '@/shared/api'
import type { AuthSession, AuthTokens, AuthUser, LoginDto } from '../model/types'

export class AuthService {
  constructor(private readonly http: HttpClient) {}

  login(credentials: LoginDto): Promise<AuthSession> {
    return this.http.request<AuthSession>('/auth/login', {
      method: 'POST',
      body: credentials,
      skipAuth: true,
    })
  }

  me(): Promise<AuthUser> {
    return this.http.request<AuthUser>('/auth/me')
  }

  refresh(refreshToken: string): Promise<AuthTokens> {
    return this.http.request<AuthTokens>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
      skipAuth: true,
    })
  }
}
