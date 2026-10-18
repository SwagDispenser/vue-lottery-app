import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Theme } from './types'

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref<Theme>('light')
  const isDark = computed(() => theme.value === 'dark')

  function setTheme(value: Theme): void {
    theme.value = value
  }

  function toggleTheme(): void {
    setTheme(isDark.value ? 'light' : 'dark')
  }

  return { theme, isDark, setTheme, toggleTheme }
}, {
  persist: {
    key: 'vue-lottery-settings',
    // Зберігаємо тільки налаштування, без computed-полів та станів запитів.
    pick: ['theme'],
    serializer: {
      serialize: JSON.stringify,
      deserialize(raw: string): { theme: Theme } {
        const saved: unknown = JSON.parse(raw)
        const theme = typeof saved === 'object' && saved !== null &&
          'theme' in saved && saved.theme === 'dark' ? 'dark' : 'light'
        return { theme }
      },
    },
  },
})
