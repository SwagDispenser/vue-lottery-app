import type { App } from 'vue'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

const LotteryPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#ecfbff', 100: '#cff4fc', 200: '#a1e9f7', 300: '#66d8ef',
      400: '#25c0e1', 500: '#00acd2', 600: '#0088a6', 700: '#006e87',
      800: '#095a6e', 900: '#104b5b', 950: '#05313e',
    },
    formField: { borderRadius: '3px', paddingX: '0.75rem', paddingY: '0.5rem' },
    colorScheme: {
      light: {
        primary: { color: '{primary.600}', contrastColor: '#ffffff', hoverColor: '{primary.700}', activeColor: '{primary.800}' },
      },
      dark: {
        primary: { color: '{primary.300}', contrastColor: '{primary.950}', hoverColor: '{primary.200}', activeColor: '{primary.100}' },
      },
    },
  },
  components: {
    button: { root: { borderRadius: '3px', paddingX: '1rem', paddingY: '0.5rem' } },
    datatable: { headerCell: { padding: '0.75rem' }, bodyCell: { padding: '0.75rem' } },
  },
})

export function setupUi(app: App): void {
  app.use(PrimeVue, {
    theme: { preset: LotteryPreset, options: { darkModeSelector: '.app-dark' } },
    locale: { close: 'Закрити', aria: { close: 'Закрити вікно' } },
  })
  app.use(ToastService)
}
