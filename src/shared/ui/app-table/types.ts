export interface AppTableColumn<TRow extends object> {
  key: string
  header: string
  sortOrder?: 'ascending' | 'descending' | 'none'
  field?: Extract<keyof TRow, string>
}
