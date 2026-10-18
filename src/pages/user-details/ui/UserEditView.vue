<script setup lang="ts">
import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { UserForm } from '@/features/user-form'
import { useUsersStore, type CreateUserDto } from '@/entities/user'

const props = defineProps<{ id: string }>()
const route = useRoute()
const router = useRouter()
const store = useUsersStore()
const { selectedUser, isLoadingUser: loading, isSaving: saving, mutationError: error } = storeToRefs(store)
const user = computed(() => selectedUser.value?.id === Number(props.id) ? selectedUser.value : null)

watch(() => props.id, () => store.clearMutationError(), { immediate: true })

async function save(input: CreateUserDto): Promise<void> {
  if (!user.value || saving.value) return
  try {
    const updated = await store.updateUser(user.value.id, input)
    await router.push({ name: 'user-detail', params: { id: updated.id }, query: route.query })
  } catch {
    // Текст помилки зберігає store; форма залишається відкритою для повторної спроби.
  }
}
</script>

<template>
  <section
    class="user-edit"
    aria-labelledby="edit-user-title"
  >
    <h2 id="edit-user-title">
      Редагувати дані
    </h2>
    <p
      v-if="loading"
      role="status"
    >
      Завантаження форми…
    </p>
    <UserForm
      v-else-if="user"
      :key="user.id"
      :initial="user"
      :busy="saving"
      :server-error="error"
      submit-label="Оновити дані"
      @save="save"
    />
    <p
      v-else-if="error"
      role="alert"
    >
      {{ error }}
    </p>
  </section>
</template>

<style scoped lang="scss">
.user-edit { padding-top: 28px; border-top: 1px solid #e8edef; }
.user-edit h2 { margin: 0 0 20px; font-size: 20px; }
</style>
