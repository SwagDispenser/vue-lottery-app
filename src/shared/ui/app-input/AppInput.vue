<script setup lang="ts">
defineProps<{
  id: string
  label: string
  modelValue: string
  type?: 'text' | 'date' | 'email' | 'tel'
  placeholder?: string
  error?: string
  max?: string
  autocomplete?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
}>()

function update(event: Event): void {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="app-field">
    <label
      class="app-field__label"
      :for="id"
    >{{ label }}</label>
    <input
      :id="id"
      class="form-control app-field__input"
      :class="{ 'is-invalid': error }"
      :type="type ?? 'text'"
      :value="modelValue"
      :placeholder="placeholder"
      :max="max"
      :autocomplete="autocomplete"
      :aria-invalid="Boolean(error)"
      :aria-describedby="error ? `${id}-error` : undefined"
      required
      @input="update"
      @blur="emit('blur')"
    >
    <div
      v-if="error"
      :id="`${id}-error`"
      class="invalid-feedback"
    >
      {{ error }}
    </div>
  </div>
</template>

<style scoped lang="scss">
.app-field {
  margin-bottom: 14px;

  &__label { display: block; margin-bottom: 4px; font-weight: 600; color: #263238; }
  &__input { min-height: 35px; border-radius: 2px; font-size: 14px; background-color: #fcfcfc; }
  &__input::placeholder { color: #9ca5aa; }
  &__input:focus { border-color: #00acd2; box-shadow: 0 0 0 2px rgba(0, 172, 210, .12); }
  .invalid-feedback { display: block; font-size: 12px; }
}
</style>
