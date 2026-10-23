import { fileURLToPath } from 'node:url'
import boundaries from 'eslint-plugin-boundaries'
import tseslint from 'typescript-eslint'
import vueParser from 'vue-eslint-parser'

const rootPath = fileURLToPath(new URL('.', import.meta.url))
const slicedLayers = ['pages', 'widgets', 'features', 'entities']
const lowerLayers = {
  app: ['pages', 'widgets', 'features', 'entities', 'shared'],
  pages: ['widgets', 'features', 'entities', 'shared'],
  widgets: ['features', 'entities', 'shared'],
  features: ['entities', 'shared'],
  entities: ['shared'],
  // app/shared складаються із сегментів. Сегменти shared можуть взаємодіяти через Public API.
  shared: ['shared'],
}
const uiModules = ['primevue', 'primevue/**', '@primevue/**', '@primeuix/**']

export const fsdConfig = {
  files: ['src/**/*.{ts,vue}'],
  plugins: { boundaries },
  settings: {
    'boundaries/root-path': rootPath,
    'boundaries/include': ['src/**/*'],
    'boundaries/elements': [
      { type: 'app', pattern: 'src/app' },
      ...slicedLayers.map((layer) => ({
        type: layer, pattern: `src/${layer}/*`, capture: ['slice'],
      })),
      { type: 'shared', pattern: 'src/shared/*', capture: ['segment'] },
    ],
    'import/resolver': {
      typescript: {
        project: fileURLToPath(new URL('./tsconfig.app.json', import.meta.url)),
        extensions: ['.ts', '.vue', '.js', '.scss'],
      },
    },
  },
  rules: {
    'boundaries/no-unknown-files': 'error',
    'boundaries/no-unknown-dependencies': 'error',
    'boundaries/dependencies': ['error', {
      default: 'disallow',
      checkAllOrigins: true,
      policies: [
        // npm-пакети дозволені; нерозпізнаний alias @/... не вважаємо пакетом.
        { allow: { to: { module: { origin: ['external', 'core'], source: '!@/**' } } } },
        ...Object.entries(lowerLayers).map(([layer, allowed]) => ({
          from: { element: { type: layer } },
          allow: { to: { element: { type: allowed, fileInternalPath: 'index.ts' } } },
        })),
        // Ці політики останні: заборону не перекриває загальний дозвіл npm-пакетів.
        {
          from: { element: { type: slicedLayers } },
          disallow: { to: { module: { source: uiModules } } },
          message: 'Імпортуйте UI-компоненти через @/shared/ui.',
        },
        {
          from: { element: { type: 'shared', captured: { segment: '!ui' } } },
          disallow: { to: { module: { source: uiModules } } },
          message: 'PrimeVue дозволений тільки у shared/ui та app/providers/ui.ts.',
        },
        {
          from: { element: { type: 'app', fileInternalPath: '!providers/ui.ts' } },
          disallow: { to: { module: { source: uiModules } } },
          message: 'Налаштування UI-бібліотеки розміщуйте в app/providers/ui.ts.',
        },
      ],
    }],
  },
}

// Окремий запуск lint:fsd перевіряє архітектуру; основний ESLint додає ці ж правила.
export default [
  { files: ['src/**/*.ts'], languageOptions: { parser: tseslint.parser } },
  {
    files: ['src/**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: { parser: tseslint.parser, extraFileExtensions: ['.vue'] },
    },
  },
  fsdConfig,
]
