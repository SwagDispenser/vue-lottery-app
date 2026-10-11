<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UserForm from '@/components/UserForm.vue'
import { userDirectory } from '@/stores/userDirectory'
import type { CreateUserDto, User } from '@/types/user'

const props = defineProps<{ id: string }>()
const route = useRoute()
const router = useRouter()
const user = ref<User | null>(null)
const loading = ref(false)
const saving = ref(false)
const error = ref('')

watch(() => props.id, async (rawId, _previous, onCleanup) => {
  const id = Number(rawId)
  if (!Number.isSafeInteger(id) || id === 0) {
    user.value = null
    loading.value = false
    error.value = 'Некоректний ідентифікатор користувача.'
    return
  }

  const controller = new AbortController()
  onCleanup(() => controller.abort())
  loading.value = true
  error.value = ''
  try {
    const result = await userDirectory.getById(id, controller.signal)
    if (!controller.signal.aborted) user.value = result
  } catch (cause) {
    if (!controller.signal.aborted) error.value = cause instanceof Error ? cause.message : 'Не вдалося завантажити форму.'
  } finally {
    if (!controller.signal.aborted) loading.value = false
  }
}, { immediate: true })

async function save(input: CreateUserDto): Promise<void> {
  if (!user.value || saving.value) return
  saving.value = true
  error.value = ''
  try {
    await userDirectory.update(user.value.id, input)
    await router.push({ name: 'user-detail', params: { id: user.value.id }, query: route.query })
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Не вдалося оновити користувача.'
  } finally {
    saving.value = false
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
