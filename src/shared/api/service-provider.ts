import { httpClient, type HttpClient } from './http-client'
import { AuthService } from '@/entities/session'
import { UserService } from '@/entities/user'

export class ServiceProvider {
  readonly users: UserService
  readonly auth: AuthService

  constructor(client: HttpClient = httpClient) {
    this.users = new UserService(client)
    this.auth = new AuthService(client)
  }
}

export const services = new ServiceProvider()
