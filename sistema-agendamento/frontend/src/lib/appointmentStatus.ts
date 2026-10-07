import type { AppointmentStatus } from '../types'

const labels: Record<AppointmentStatus, string> = {
  scheduled: 'Agendado',
  confirmed: 'Confirmado',
  completed: 'Realizado',
  cancelled: 'Cancelado',
}

const styles: Record<AppointmentStatus, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-zinc-200 text-zinc-700',
  cancelled: 'bg-red-100 text-red-800 line-through',
}

export function statusLabel(status: AppointmentStatus): string {
  return labels[status]
}

export function statusBadgeClass(status: AppointmentStatus): string {
  return styles[status]
}
