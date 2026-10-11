import { httpClient, type HttpClient } from '@/api/httpClient'
import { AuthService } from './AuthService'
import { UserService } from './UserService'

export class ServiceProvider {
  readonly users: UserService
  readonly auth: AuthService

  constructor(client: HttpClient = httpClient) {
    this.users = new UserService(client)
    this.auth = new AuthService(client)
  }
}

export const services = new ServiceProvider()
