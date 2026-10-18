import { AuthService } from '@/entities/session'
import { UserService } from '@/entities/user'
import { HttpClient, ServiceProvider } from '@/shared/api'
import { API_URL } from '@/shared/config'

export const httpClient = new HttpClient(API_URL)

export function registerServices(client: HttpClient = httpClient): void {
  ServiceProvider.register('users', () => new UserService(client))
  ServiceProvider.register('auth', () => new AuthService(client))
}
