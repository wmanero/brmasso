import { useCallback, useEffect, useMemo, useState } from 'react'
import { AppointmentDetailSheet } from '../components/AppointmentDetailSheet'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { statusBadgeClass, statusLabel } from '../lib/appointmentStatus'
import { addDays, formatDayLabel, formatTime, parseApiDateTime, startOfWeek, toApiRangeBoundary } from '../lib/datetime'
import type { Appointment, User } from '../types'

export function AgendaPage() {
  const { token, user } = useAuth()
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [therapists, setTherapists] = useState<User[]>([])
  const [filterTherapistId, setFilterTherapistId] = useState<number | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Appointment | null>(null)

  const range = useMemo(() => {
    const from = weekStart
    const to = addDays(weekStart, 7)
    to.setHours(23, 59, 59, 999)
    return { from: toApiRangeBoundary(from), to: toApiRangeBoundary(to) }
  }, [weekStart])

  const reload = useCallback(() => {
    if (!token) return
    setLoading(true)
    setError('')
    api
      .appointments(token, {
        ...range,
        therapist_id: filterTherapistId === 'all' ? undefined : filterTherapistId,
      })
      .then(setAppointments)
      .catch(() => setError('Nao foi possivel carregar a agenda'))
      .finally(() => setLoading(false))
  }, [token, range, filterTherapistId])

  useEffect(() => {
    if (!token) return
    let cancelled = false
    api.therapists(token).then((th) => {
      if (!cancelled) setTherapists(th)
    })
    return () => {
      cancelled = true
    }
  }, [token])

  useEffect(() => {
    reload()
  }, [reload])

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])

  const byDay = useMemo(() => {
    const map = new Map<string, Appointment[]>()
    for (const day of days) {
      map.set(day.toDateString(), [])
    }
    for (const appt of appointments) {
      const key = parseApiDateTime(appt.starts_at).toDateString()
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(appt)
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.starts_at.localeCompare(b.starts_at))
    }
    return map
  }, [appointments, days])

  function handleUpdated(appt: Appointment) {
    setAppointments((list) => list.map((item) => (item.id === appt.id ? appt : item)))
    reload()
  }

  return (
    <div className="space-y-5 lg:space-y-6">
      {selected ? (
        <AppointmentDetailSheet appointment={selected} onClose={() => setSelected(null)} onUpdated={handleUpdated} />
      ) : null}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 lg:text-2xl">Agenda compartilhada</h2>
          <p className="mt-1 text-sm text-zinc-600 lg:text-base">Horarios de todas as profissionais</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium shadow-sm lg:px-5"
            onClick={() => setWeekStart((d) => addDays(d, -7))}
          >
            ← Semana anterior
          </button>
          <button
            type="button"
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium shadow-sm lg:px-5"
            onClick={() => setWeekStart(startOfWeek(new Date()))}
          >
            Hoje
          </button>
          <button
            type="button"
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium shadow-sm lg:px-5"
            onClick={() => setWeekStart((d) => addDays(d, 7))}
          >
            Proxima semana →
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 lg:gap-3">
        <button
          type="button"
          onClick={() => setFilterTherapistId('all')}
          className={`rounded-full px-3 py-1.5 text-sm ${
            filterTherapistId === 'all' ? 'bg-zinc-900 text-white' : 'bg-white border border-zinc-200'
          }`}
        >
          Todas
        </button>
        {therapists.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setFilterTherapistId(t.id)}
            className={`rounded-full px-3 py-1.5 text-sm border ${
              filterTherapistId === t.id ? 'text-white border-transparent' : 'bg-white border-zinc-200'
            }`}
            style={filterTherapistId === t.id ? { backgroundColor: t.calendar_color } : undefined}
          >
            {t.full_name.split(' ')[0]}
          </button>
        ))}
        {user ? (
          <button
            type="button"
            onClick={() => setFilterTherapistId(user.id)}
            className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-sm text-violet-800"
          >
            So minha
          </button>
        ) : null}
      </div>

      {loading ? <p className="text-sm text-zinc-500">Carregando…</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7 lg:gap-4">
        {days.map((day) => {
          const items = byDay.get(day.toDateString()) ?? []
          return (
            <section
              key={day.toISOString()}
              className="flex min-h-0 flex-col rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm lg:min-h-[280px]"
            >
              <h3 className="border-b border-zinc-100 pb-2 text-sm font-semibold capitalize text-zinc-800 lg:text-base">
                {formatDayLabel(day)}
              </h3>
              {items.length === 0 ? (
                <p className="mt-3 text-sm text-zinc-400">Sem agendamentos</p>
              ) : (
                <ul className="mt-3 space-y-2 lg:flex-1 lg:overflow-y-auto lg:pr-1">
                  {items.map((appt) => (
                    <li key={appt.id}>
                      <button
                        type="button"
                        onClick={() => setSelected(appt)}
                        className={`w-full rounded-xl border border-zinc-100 bg-zinc-50 p-3 text-left transition hover:border-violet-200 hover:shadow-sm lg:p-3.5 ${
                          appt.status === 'cancelled' ? 'opacity-60' : ''
                        }`}
                        style={{ borderLeftWidth: 4, borderLeftColor: appt.therapist_color ?? '#6366f1' }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-zinc-900">{formatTime(appt.starts_at)}</p>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusBadgeClass(appt.status)}`}>
                            {statusLabel(appt.status)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-zinc-800">{appt.client_name}</p>
                        <p className="text-sm text-zinc-600">{appt.service_name}</p>
                        <p className="text-xs text-zinc-500">{appt.therapist_name}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
