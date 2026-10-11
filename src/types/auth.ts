export interface LoginDto {
  username: string
  password: string
}

export interface AuthUser {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  gender: string
  image: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export type AuthSession = AuthUser & AuthTokens
