<script setup lang="ts">
withDefaults(defineProps<{
  type?: 'button' | 'submit'
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  disabled?: boolean
}>(), {
  type: 'button',
  variant: 'primary',
  disabled: false,
})
</script>

<template>
  <button
    class="btn app-button"
    :class="`app-button--${variant}`"
    :type="type"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<style scoped lang="scss">
.app-button {
  border-radius: 3px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.35;
  padding: 8px 16px;
  white-space: nowrap;

  &--primary { background: #00acd2; border-color: #00acd2; color: #fff; }
  &--primary:hover:not(:disabled) { background: #008eae; border-color: #008eae; color: #fff; }
  &--secondary { background: #eef3f5; border-color: #dce5e8; color: #34454b; }
  &--danger { background: #d9534f; border-color: #d9534f; color: #fff; }
  &--ghost { background: transparent; border-color: transparent; color: #008fad; padding: 5px 8px; }
  &--ghost:hover:not(:disabled) { background: #e9f8fb; color: #007a95; }
  &:disabled { cursor: not-allowed; opacity: .5; }
}
</style>
