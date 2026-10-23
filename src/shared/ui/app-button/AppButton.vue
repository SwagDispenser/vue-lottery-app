<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'

const props = withDefaults(defineProps<{
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  label?: string
  disabled?: boolean
  loading?: boolean
}>(), {
  type: 'button',
  variant: 'primary',
  label: undefined,
  disabled: false,
  loading: false,
})

const severity = computed(() => {
  if (props.variant === 'secondary' || props.variant === 'danger') return props.variant
  return undefined
})
</script>

<template>
  <Button
    class="app-button"
    :class="`app-button--${variant}`"
    :type="type"
    :severity="severity"
    :text="variant === 'ghost'"
    :label="label"
    :disabled="disabled || loading"
    :loading="loading"
    :aria-busy="loading"
  >
    <span
      v-if="loading"
      class="app-button__spinner"
      aria-hidden="true"
    />
    <slot>{{ label }}</slot>
  </Button>
</template>

<style scoped lang="scss">
.app-button {
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.35;
  white-space: nowrap;

  &__spinner {
    width: 1em;
    height: 1em;
    border: 2px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: app-button-spin .7s linear infinite;
  }
  &--ghost { padding: 5px 8px; }
  &:disabled { cursor: not-allowed; opacity: .5; }
}
@keyframes app-button-spin { to { transform: rotate(360deg); } }
</style>
