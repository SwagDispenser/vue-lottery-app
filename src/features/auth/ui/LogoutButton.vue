<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/entities/session'

const auth = useAuthStore()
const router = useRouter()

async function logout(): Promise<void> {
  auth.logout()
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
