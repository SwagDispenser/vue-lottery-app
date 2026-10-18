export interface AppTableColumn<TRow extends object> {
  key: string
  header: string
  field?: Extract<keyof TRow, string>
}
