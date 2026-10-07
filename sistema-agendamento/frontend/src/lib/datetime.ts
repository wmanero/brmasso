export function startOfWeek(date: Date): Date {
  const copy = new Date(date)
  const day = copy.getDay()
  const diff = day === 0 ? -6 : 1 - day
  copy.setDate(copy.getDate() + diff)
  copy.setHours(0, 0, 0, 0)
  return copy
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

export function toIsoLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** Envia o horario exibido no formulario, sem converter para UTC. */
export function datetimeLocalFieldToApi(value: string): string {
  if (value.length === 16) return `${value}:00`
  return value
}

/** API devolve naive local; evita tratar como UTC quando vier com Z de versoes antigas. */
export function parseApiDateTime(iso: string): Date {
  const normalized = iso.includes('T') ? iso.replace('Z', '') : iso
  return new Date(normalized)
}

export function toApiRangeBoundary(date: Date): string {
  return `${toIsoLocal(date)}:00`
}

export function toDatetimeLocalField(iso: string): string {
  return toIsoLocal(parseApiDateTime(iso))
}

export function splitDatetimeLocal(value: string): { date: string; time: string } {
  const [date = '', timePart = ''] = value.split('T')
  const time = timePart.slice(0, 5)
  return { date, time: time || '09:00' }
}

export function joinDatetimeLocal(date: string, time: string): string {
  return `${date}T${time}`
}

/** Horarios comerciais tipicos do espaco (intervalos de 15 min). */
export function buildAppointmentTimeSlots(
  startHour = 7,
  endHour = 21,
  stepMinutes = 15,
): string[] {
  const slots: string[] = []
  const pad = (n: number) => String(n).padStart(2, '0')
  for (let h = startHour; h <= endHour; h++) {
    for (let m = 0; m < 60; m += stepMinutes) {
      if (h === endHour && m > 0) break
      slots.push(`${pad(h)}:${pad(m)}`)
    }
  }
  return slots
}

export const APPOINTMENT_TIME_SLOTS = buildAppointmentTimeSlots()

export function roundDatetimeLocalToNextSlot(date: Date, stepMinutes = 15): string {
  const copy = new Date(date)
  const minutes = copy.getMinutes()
  const remainder = minutes % stepMinutes
  if (remainder !== 0) {
    copy.setMinutes(minutes + (stepMinutes - remainder))
  }
  copy.setSeconds(0, 0)
  return toIsoLocal(copy)
}

export function defaultAppointmentStart(): string {
  return roundDatetimeLocalToNextSlot(new Date())
}

export function todayDateInputValue(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function formatDayLabel(date: Date): string {
  return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
}

export function formatTime(iso: string): string {
  return parseApiDateTime(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function formatDateTime(iso: string): string {
  return parseApiDateTime(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
