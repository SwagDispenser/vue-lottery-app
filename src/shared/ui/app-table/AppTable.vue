<script setup lang="ts" generic="TRow extends object">
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import type { AppTableColumn } from './types'

withDefaults(defineProps<{
  rows: TRow[]
  columns: AppTableColumn<TRow>[]
  rowKey: Extract<keyof TRow, string>
  label: string
  loading?: boolean
  minWidth?: string
  emptyMessage?: string
}>(), {
  loading: false,
  minWidth: '48rem',
  emptyMessage: 'Записів не знайдено.',
})

defineSlots<{
  empty?(): unknown
  [name: `cell-${string}`]: (props: { row: TRow; index: number }) => unknown
}>()

// Нетипізований payload бібліотеки обмежено інтерфейсом рядка на межі обгортки.
function asRow(value: unknown): TRow {
  return value as TRow
}
</script>

<template>
  <div class="app-table">
    <DataTable
      :value="rows"
      :data-key="rowKey"
      :loading="loading"
      :table-props="{ 'aria-label': label }"
      :table-style="{ minWidth }"
      size="small"
    >
      <Column
        v-for="column in columns"
        :key="column.key"
        :field="column.field"
        :header="column.header"
      >
        <template #body="{ data, index }">
          <slot
            :name="`cell-${column.key}`"
            :row="asRow(data)"
            :index="index"
          >
            {{ column.field ? asRow(data)[column.field] : '' }}
          </slot>
        </template>
      </Column>
      <template #empty>
        <div class="app-table__empty">
          <slot name="empty">
            {{ emptyMessage }}
          </slot>
        </div>
      </template>
    </DataTable>
  </div>
</template>

<style scoped lang="scss">
.app-table {
  overflow-x: auto;
  font-size: 14px;

  &__empty { padding: 24px; text-align: center; }
}
</style>
