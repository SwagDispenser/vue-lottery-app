<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/entities/session'

const auth = useSessionStore()
const router = useRouter()

async function logout(): Promise<void> {
  auth.clearSession()
  await router.replace({ name: 'login' })
}
</script>

<template>
  <button
    class="navigation__link navigation__logout"
    type="button"
    @click="logout"
  >
    Logout
  </button>
</template>
