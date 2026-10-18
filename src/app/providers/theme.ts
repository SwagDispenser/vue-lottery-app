import { watch } from 'vue'
import { useSettingsStore } from '@/entities/settings'
import { pinia } from './pinia'

export function setupTheme(): void {
  const settings = useSettingsStore(pinia)
  // Плагін відновлює theme при створенні store; застосовуємо її до першого render.
  watch(() => settings.theme, (theme) => {
    document.documentElement.classList.toggle('app-dark', theme === 'dark')
    document.documentElement.dataset.bsTheme = theme
  }, { immediate: true, flush: 'sync' })
}
