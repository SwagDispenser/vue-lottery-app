<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/entities/session'
import { AppButton } from '@/shared/ui'

const auth = useSessionStore()
const router = useRouter()

async function logout(): Promise<void> {
  auth.clearSession()
  await router.replace({ name: 'login' })
}
</script>

<template>
  <AppButton
    variant="ghost"
    @click="logout"
  >
    Logout
  </AppButton>
</template>
