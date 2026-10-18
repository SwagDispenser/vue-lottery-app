import { readdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ESLint } from 'eslint'

const root = fileURLToPath(new URL('../', import.meta.url))
const eslint = new ESLint({ cwd: root, overrideConfigFile: resolve(root, 'eslint.fsd.config.js') })

async function messages(file: string, code: string) {
  const source = file.endsWith('.vue') ? `<script setup lang="ts">\n${code}\n</script>` : code
  const [result] = await eslint.lintText(source, { filePath: resolve(root, file) })
  expect(result?.messages.some((message) => message.fatal)).toBe(false)
  return result?.messages ?? []
}

const allowed = [
  ['src/pages/home/ui/HomeView.vue', "import { useUsersStore } from '@/entities/user'"],
  ['src/features/auth/ui/LoginForm.vue', "import type { LoginDto } from '@/entities/session/index.ts'"],
  ['src/features/auth/ui/LoginForm.vue', "import LogoutButton from './LogoutButton.vue'"],
  ['src/shared/ui/app-confirm-dialog/AppConfirmDialog.vue', "import AppButton from '../app-button/AppButton.vue'"],
  ['src/shared/api/http-client.ts', "import { API_URL } from '@/shared/config'"],
  ['src/app/main.ts', "import './styles/main.scss'"],
  ['src/app/providers/router/index.ts', "void import('@/pages/home')"],
  ['src/entities/user/index.ts', "export type { User } from './model/types'"],
  ['src/shared/ui/app-button/AppButton.vue', "import Button from 'primevue/button'"],
  ['src/app/providers/ui.ts', "import PrimeVue from 'primevue/config'"],
] as const

const forbidden = [
  ['upward shared import', 'src/shared/api/http-client.ts', "import { UserService } from '@/entities/user'"],
  ['upward feature import', 'src/features/auth/ui/LoginForm.vue', "import { UsersView } from '@/pages/users'"],
  ['sibling entities', 'src/entities/session/model/session.store.ts', "import { useUsersStore } from '@/entities/user'"],
  ['sibling features', 'src/features/auth/ui/LoginForm.vue', "import { UserForm } from '@/features/user-form'"],
  ['sibling widgets', 'src/widgets/app-header/ui/AppHeader.vue', "import { UsersTable } from '@/widgets/users-table'"],
  ['sibling pages', 'src/pages/home/ui/HomeView.vue', "import { AboutView } from '@/pages/about'"],
  ['deep type import', 'src/pages/home/ui/HomeView.vue', "import type { User } from '@/entities/user/model/types'"],
  ['relative deep import', 'src/pages/home/ui/HomeView.vue', "import type { User } from '../../../entities/user/model/types'"],
  ['deep re-export', 'src/features/auth/index.ts', "export { UserService } from '@/entities/user/api/user.service'"],
  ['deep lazy import', 'src/app/providers/router/index.ts', "void import('@/pages/home/ui/HomeView.vue')"],
  ['deep shared segment import', 'src/shared/api/http-client.ts', "import { API_URL } from '@/shared/config/env'"],
  ['PrimeVue in page', 'src/pages/home/ui/HomeView.vue', "import Button from 'primevue/button'"],
  ['PrimeVue in entity', 'src/entities/settings/model/settings.store.ts', "import { useToast } from 'primevue/usetoast'"],
  ['PrimeVue outside shared/ui', 'src/shared/api/http-client.ts', "import Button from 'primevue/button'"],
  ['PrimeVue outside app UI provider', 'src/app/main.ts', "import PrimeVue from 'primevue/config'"],
  ['theme library outside UI', 'src/features/theme/ui/ThemeToggle.vue', "import Aura from '@primeuix/themes/aura'"],
] as const

describe('FSD ESLint boundaries', () => {
  it.each(allowed)('allows %s: %s', async (file, code) => {
    expect(await messages(file, code)).toEqual([])
  })

  it.each(forbidden)('rejects %s', async (_description, file, code) => {
    const result = await messages(file, code)
    expect(result.some((message) => message.ruleId === 'boundaries/dependencies' && message.severity === 2)).toBe(true)
  })

  it('rejects source files outside the FSD structure', async () => {
    const result = await messages('src/loose.ts', 'export const value = 1')
    expect(result.some((message) => message.ruleId === 'boundaries/no-unknown-files')).toBe(true)
  })

  it.each([
    ['@/missing-module', 'boundaries/dependencies'],
    ['../../../missing-module', 'boundaries/no-unknown-dependencies'],
  ])('rejects unresolved local import %s', async (source, ruleId) => {
    const result = await messages('src/pages/home/ui/HomeView.vue', `import Missing from '${source}'`)
    expect(result.some((message) => message.ruleId === ruleId && message.severity === 2)).toBe(true)
  })

  it('requires an index.ts Public API for each slice and shared segment', () => {
    for (const layer of ['pages', 'widgets', 'features', 'entities', 'shared']) {
      for (const slice of readdirSync(resolve(root, 'src', layer), { withFileTypes: true })) {
        if (slice.isDirectory()) expect(existsSync(resolve(root, 'src', layer, slice.name, 'index.ts'))).toBe(true)
      }
    }
  })
})
