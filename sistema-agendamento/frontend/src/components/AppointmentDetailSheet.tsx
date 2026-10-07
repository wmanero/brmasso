import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api, ApiError } from '../lib/api'
import { statusBadgeClass, statusLabel } from '../lib/appointmentStatus'
import { AppointmentDateTimeFields } from './AppointmentDateTimeFields'
import { normalizeServiceName, ServiceSelect } from './ServiceSelect'
import { datetimeLocalFieldToApi, formatDateTime, toDatetimeLocalField } from '../lib/datetime'
import type { Anamnesis, Appointment, AppointmentStatus, Client, User } from '../types'

type Props = {
  appointment: Appointment
  onClose: () => void
  onUpdated: (appt: Appointment) => void
}

export function AppointmentDetailSheet({ appointment, onClose, onUpdated }: Props) {
  const { token } = useAuth()
  const [editing, setEditing] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [therapists, setTherapists] = useState<User[]>([])
  const [latestAnamnesis, setLatestAnamnesis] = useState<Anamnesis | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({
    client_id: String(appointment.client_id),
    therapist_id: String(appointment.therapist_id),
    service_name: normalizeServiceName(appointment.service_name),
    starts_at: toDatetimeLocalField(appointment.starts_at),
    duration_minutes: String(appointment.duration_minutes),
    status: appointment.status,
    notes: appointment.notes ?? '',
  })

  useEffect(() => {
    if (!token) return
    Promise.all([
      api.clients(token),
      api.therapists(token),
      api.anamneses(token, appointment.client_id),
    ]).then(([c, t, anamneses]) => {
      setClients(c)
      setTherapists(t)
      setLatestAnamnesis(anamneses[0] ?? null)
    })
  }, [token, appointment.client_id])

  async function patchStatus(status: AppointmentStatus) {
    if (!token) return
    setError('')
    setBusy(true)
    try {
      const updated = await api.updateAppointment(token, appointment.id, { status })
      onUpdated(updated)
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao atualizar')
    } finally {
      setBusy(false)
    }
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault()
    if (!token) return
    setError('')
    setBusy(true)
    try {
      const updated = await api.updateAppointment(token, appointment.id, {
        client_id: Number(form.client_id),
        therapist_id: Number(form.therapist_id),
        service_name: form.service_name.trim(),
        starts_at: datetimeLocalFieldToApi(form.starts_at),
        duration_minutes: Number(form.duration_minutes),
        status: form.status,
        notes: form.notes.trim() || null,
      })
      onUpdated(updated)
      setEditing(false)
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao salvar')
    } finally {
      setBusy(false)
    }
  }

  const isFinal = appointment.status === 'cancelled' || appointment.status === 'completed'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 lg:items-center lg:p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl lg:max-h-[90dvh] lg:max-w-2xl lg:rounded-2xl"
      >
        <div className="flex items-start justify-between border-b border-zinc-200 px-4 py-4 lg:px-6">
          <div>
            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(appointment.status)}`}>
              {statusLabel(appointment.status)}
            </span>
            <h2 className="mt-2 text-lg font-semibold text-zinc-900 lg:text-xl">{appointment.service_name}</h2>
            <p className="text-sm text-zinc-600">{formatDateTime(appointment.starts_at)} · {appointment.duration_minutes} min</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg px-2 py-1 text-2xl leading-none text-zinc-500 hover:bg-zinc-100">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 lg:px-6">
          {!editing ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-zinc-50 p-4">
                <p className="text-xs font-medium uppercase text-zinc-500">Cliente</p>
                <p className="font-medium text-zinc-900">{appointment.client_name}</p>
                <Link
                  to={`/clientes/${appointment.client_id}`}
                  className="mt-1 inline-block text-sm text-violet-700 hover:underline"
                  onClick={onClose}
                >
                  Ver ficha e anamnese →
                </Link>
              </div>
              <div className="rounded-xl bg-zinc-50 p-4">
                <p className="text-xs font-medium uppercase text-zinc-500">Profissional</p>
                <p className="font-medium" style={{ color: appointment.therapist_color ?? undefined }}>
                  {appointment.therapist_name}
                </p>
              </div>
              {appointment.notes ? (
                <div className="rounded-xl bg-zinc-50 p-4">
                  <p className="text-xs font-medium uppercase text-zinc-500">Observacoes</p>
                  <p className="text-sm text-zinc-700">{appointment.notes}</p>
                </div>
              ) : null}
              {latestAnamnesis ? (
                <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-4">
                  <p className="text-xs font-medium uppercase text-violet-800">Ultima anamnese</p>
                  <p className="mt-2 text-sm">
                    <span className="font-medium">Resumo:</span> {latestAnamnesis.summary}
                  </p>
                  <p className="mt-1 text-sm">
                    <span className="font-medium">Dores:</span> {latestAnamnesis.pain_points}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-zinc-500">Sem anamnese cadastrada para este cliente.</p>
              )}
            </div>
          ) : (
            <form id="edit-appointment-form" onSubmit={handleSave} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                Cliente
                <select
                  required
                  value={form.client_id}
                  onChange={(e) => setForm((f) => ({ ...f, client_id: e.target.value }))}
                  className="field-select mt-1 py-2"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                Profissional
                <select
                  required
                  value={form.therapist_id}
                  onChange={(e) => setForm((f) => ({ ...f, therapist_id: e.target.value }))}
                  className="field-select mt-1 py-2"
                >
                  {therapists.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name}
                    </option>
                  ))}
                </select>
              </label>
              <AppointmentDateTimeFields
                value={form.starts_at}
                onChange={(starts_at) => setForm((f) => ({ ...f, starts_at }))}
              />
              <label className="block text-sm">
                Servico
                <ServiceSelect
                  required
                  allowLegacy
                  value={form.service_name}
                  className="field-select mt-1 py-2"
                  onChange={(title, duration) =>
                    setForm((f) => ({
                      ...f,
                      service_name: title,
                      ...(duration ? { duration_minutes: String(duration) } : {}),
                    }))
                  }
                />
              </label>
              <label className="block text-sm">
                Duracao (min)
                <input
                  type="number"
                  min={15}
                  max={240}
                  step={15}
                  required
                  value={form.duration_minutes}
                  onChange={(e) => setForm((f) => ({ ...f, duration_minutes: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                Status
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as AppointmentStatus }))}
                  className="field-select mt-1 py-2"
                >
                  <option value="scheduled">Agendado</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="completed">Realizado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </label>
              <label className="block text-sm sm:col-span-2">
                Observacoes
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2"
                />
              </label>
            </form>
          )}
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-zinc-200 px-4 py-4 lg:px-6">
          {!editing ? (
            <>
              {!isFinal ? (
                <>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setEditing(true)}
                    className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => patchStatus('completed')}
                    className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white"
                  >
                    Marcar realizado
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => patchStatus('cancelled')}
                    className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setEditing(true)}
                  className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium"
                >
                  Reabrir / editar
                </button>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => setEditing(false)}
                className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium"
              >
                Voltar
              </button>
              <button
                type="submit"
                form="edit-appointment-form"
                disabled={busy}
                className="rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Salvar alteracoes
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
