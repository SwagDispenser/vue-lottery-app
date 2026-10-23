import { useToast } from 'primevue/usetoast'

export function useNotification() {
  const toast = useToast()

  function success(detail: string): void {
    toast.add({ severity: 'success', summary: 'Готово', detail, life: 4000 })
  }

  function error(detail: string): void {
    toast.add({ severity: 'error', summary: 'Помилка', detail, life: 6000 })
  }

  return { success, error }
}
