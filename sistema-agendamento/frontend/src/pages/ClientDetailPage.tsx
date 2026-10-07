import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api, ApiError } from '../lib/api'
import { formatDateTime } from '../lib/datetime'
import type { Anamnesis, Client } from '../types'

export function ClientDetailPage() {
  const { id } = useParams()
  const clientId = Number(id)
  const { token } = useAuth()
  const [client, setClient] = useState<Client | null>(null)
  const [anamneses, setAnamneses] = useState<Anamnesis[]>([])
  const [form, setForm] = useState({ summary: '', pain_points: '', contraindications: '' })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token || !clientId) return
    Promise.all([api.client(token, clientId), api.anamneses(token, clientId)])
      .then(([c, list]) => {
        setClient(c)
        setAnamneses(list)
      })
      .catch(() => setError('Cliente nao encontrado'))
  }, [token, clientId])

  async function handleAnamnesis(event: FormEvent) {
    event.preventDefault()
    if (!token) return
    setError('')
    setMessage('')
    try {
      await api.createAnamnesis(token, clientId, {
        summary: form.summary.trim(),
        pain_points: form.pain_points.trim(),
        contraindications: form.contraindications.trim() || null,
      })
      setForm({ summary: '', pain_points: '', contraindications: '' })
      setMessage('Anamnese registrada')
      const list = await api.anamneses(token, clientId)
      setAnamneses(list)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao salvar anamnese')
    }
  }

  if (!client) {
    return (
      <div>
        <Link to="/clientes" className="text-sm font-medium text-violet-700 hover:text-violet-900">
          ← Voltar
        </Link>
        <p className="mt-4 text-sm text-zinc-500">{error || 'Carregando…'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-5 lg:space-y-6">
      <Link to="/clientes" className="inline-block text-sm font-medium text-violet-700 hover:text-violet-900">
        ← Clientes
      </Link>

      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-8 xl:gap-10">
        <div className="space-y-5">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm lg:p-6">
            <h2 className="text-xl font-semibold lg:text-2xl">{client.full_name}</h2>
            <p className="mt-2 text-sm text-zinc-600 lg:text-base">{client.phone}</p>
            {client.email ? <p className="text-sm text-zinc-600 lg:text-base">{client.email}</p> : null}
            {client.notes ? <p className="mt-3 text-sm leading-relaxed text-zinc-700 lg:text-base">{client.notes}</p> : null}
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm lg:p-6">
            <h3 className="text-lg font-semibold text-zinc-900">Nova anamnese (simples)</h3>
            <form onSubmit={handleAnamnesis} className="mt-4 space-y-4">
              <label className="block text-sm lg:text-base">
                Resumo / queixa principal
                <textarea
                  required
                  rows={3}
                  value={form.summary}
                  onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 px-3 py-2.5 lg:px-4"
                />
              </label>
              <label className="block text-sm lg:text-base">
                Pontos de dor / areas
                <textarea
                  required
                  rows={3}
                  value={form.pain_points}
                  onChange={(e) => setForm((f) => ({ ...f, pain_points: e.target.value }))}
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 px-3 py-2.5 lg:px-4"
                />
              </label>
              <label className="block text-sm lg:text-base">
                Contraindicacoes (opcional)
                <textarea
                  rows={2}
                  value={form.contraindications}
                  onChange={(e) => setForm((f) => ({ ...f, contraindications: e.target.value }))}
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 px-3 py-2.5 lg:px-4"
                />
              </label>
              <button
                type="submit"
                className="w-full rounded-xl bg-violet-700 py-3 text-sm font-semibold text-white lg:max-w-xs"
              >
                Salvar anamnese
              </button>
            </form>
            {message ? <p className="mt-3 text-sm text-green-700">{message}</p> : null}
            {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
          </section>
        </div>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-zinc-900 lg:text-xl">Historico</h3>
          {anamneses.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-500">
              Nenhuma anamnese ainda.
            </p>
          ) : (
            <div className="space-y-3 lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto lg:pr-2">
              {anamneses.map((item) => (
                <article key={item.id} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm lg:p-6">
                  <p className="text-xs text-zinc-500 lg:text-sm">{formatDateTime(item.submitted_at)}</p>
                  <p className="mt-3 text-sm leading-relaxed lg:text-base">
                    <span className="font-medium text-zinc-800">Resumo:</span> {item.summary}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed lg:text-base">
                    <span className="font-medium text-zinc-800">Dores:</span> {item.pain_points}
                  </p>
                  {item.contraindications ? (
                    <p className="mt-2 text-sm leading-relaxed lg:text-base">
                      <span className="font-medium text-zinc-800">Contraindicacoes:</span> {item.contraindications}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
