import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api, ApiError } from '../lib/api'
import { datetimeLocalFieldToApi, toIsoLocal } from '../lib/datetime'
import type { AppointmentStatus, Client, User } from '../types'

export function NewAppointmentPage() {
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const [clients, setClients] = useState<Client[]>([])
  const [therapists, setTherapists] = useState<User[]>([])
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    client_id: '',
    therapist_id: '',
    service_name: 'Massagem',
    starts_at: toIsoLocal(new Date()),
    duration_minutes: '60',
    status: 'scheduled' as AppointmentStatus,
    notes: '',
  })

  useEffect(() => {
    if (!token) return
    Promise.all([api.clients(token), api.therapists(token)]).then(([c, t]) => {
      setClients(c)
      setTherapists(t)
      setForm((f) => ({
        ...f,
        therapist_id: String(user?.id ?? t[0]?.id ?? ''),
        client_id: String(c[0]?.id ?? ''),
      }))
    })
  }, [token, user?.id])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!token) return
    setError('')
    try {
      await api.createAppointment(token, {
        client_id: Number(form.client_id),
        therapist_id: Number(form.therapist_id),
        service_name: form.service_name.trim(),
        starts_at: datetimeLocalFieldToApi(form.starts_at),
        duration_minutes: Number(form.duration_minutes),
        status: form.status,
        notes: form.notes.trim() || null,
      })
      navigate('/')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao agendar')
    }
  }

  return (
    <div className="space-y-5 lg:space-y-6">
      <div>
        <h2 className="text-xl font-semibold lg:text-2xl">Novo agendamento</h2>
        <p className="mt-1 text-sm text-zinc-600 lg:text-base">Conflito apenas na mesma profissional</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm lg:max-w-4xl lg:grid-cols-2 lg:gap-6 lg:p-8"
      >
        <label className="block text-sm">
          Cliente
          <select
            required
            value={form.client_id}
            onChange={(e) => setForm((f) => ({ ...f, client_id: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-3 text-base"
          >
            <option value="">Selecione</option>
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
            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-3 text-base"
          >
            {therapists.map((t) => (
              <option key={t.id} value={t.id}>
                {t.full_name}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          Servico
          <input
            required
            value={form.service_name}
            onChange={(e) => setForm((f) => ({ ...f, service_name: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-3 text-base"
          />
        </label>

        <label className="block text-sm">
          Data e hora
          <input
            type="datetime-local"
            required
            value={form.starts_at}
            onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-3 text-base"
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
            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-3 text-base"
          />
        </label>

        <label className="block text-sm lg:col-span-2">
          Observacoes
          <textarea
            rows={2}
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 lg:px-4"
          />
        </label>

        {error ? (
          <p className="text-sm text-red-600 lg:col-span-2">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className="w-full rounded-xl bg-violet-700 py-3 text-base font-semibold text-white lg:col-span-2 lg:max-w-sm"
        >
          Confirmar agendamento
        </button>
      </form>
    </div>
  )
}
