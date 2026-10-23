type Factory<T> = () => T

export class ServiceProvider {
  private static factories = new Map<string, Factory<unknown>>()
  private static instances = new Map<string, unknown>()

  static register<T>(key: string, factory: Factory<T>): void {
    this.factories.set(key, factory)
    this.instances.delete(key)
  }

  static get<T>(key: string): T {
    if (!this.instances.has(key)) {
      const factory = this.factories.get(key)
      if (!factory) throw new Error(`Сервіс "${key}" не зареєстровано.`)
      this.instances.set(key, factory())
    }
    return this.instances.get(key) as T
  }
}
