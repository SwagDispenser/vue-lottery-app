<script setup lang="ts" generic="T extends string | number | undefined = string">
import InputText from 'primevue/inputtext'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  id: string
  label: string
  modelValue?: T
  type?: 'text' | 'date' | 'email' | 'tel' | 'password' | 'number' | 'search'
  placeholder?: string
  error?: string
  min?: string | number
  max?: string | number
  autocomplete?: string
  required?: boolean
  disabled?: boolean
}>(), {
  modelValue: undefined,
  type: 'text',
  placeholder: undefined,
  error: undefined,
  min: undefined,
  max: undefined,
  autocomplete: undefined,
  required: true,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: T]
  blur: [event: FocusEvent]
  change: [event: Event]
}>()

function update(value: string | undefined): void {
  // InputText працює з рядком; числове поле повертає число або undefined, коли порожнє.
  const nextValue = props.type === 'number'
    ? value === '' || value === undefined ? undefined : Number(value)
    : value ?? ''
  emit('update:modelValue', nextValue as T)
}
</script>

<template>
  <div class="app-field">
    <label
      class="app-field__label"
      :for="id"
    >{{ label }}</label>
    <InputText
      v-bind="$attrs"
      :id="id"
      class="app-field__input"
      :model-value="modelValue === undefined ? '' : String(modelValue)"
      :type="type"
      :placeholder="placeholder"
      :min="min"
      :max="max"
      :autocomplete="autocomplete"
      :required="required"
      :disabled="disabled"
      :invalid="Boolean(error)"
      :aria-invalid="Boolean(error)"
      :aria-describedby="error ? `${id}-error` : undefined"
      @update:model-value="update"
      @blur="emit('blur', $event)"
      @change="emit('change', $event)"
    />
    <small
      v-if="error"
      :id="`${id}-error`"
      class="app-field__error"
      aria-live="polite"
    >
      {{ error }}
    </small>
  </div>
</template>

<style scoped lang="scss">
.app-field {
  margin-bottom: 14px;

  &__label { display: block; margin-bottom: 4px; font-weight: 600; }
  &__input { width: 100%; min-height: 35px; font-family: inherit; font-size: 14px; }
  &__error { display: block; margin-top: 4px; color: var(--app-error-text); font-size: 12px; }
}
</style>
