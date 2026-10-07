import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api, ApiError } from '../lib/api'
import type { Client } from '../types'

export function ClientsPage() {
  const { token } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', notes: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function load() {
    if (!token) return
    const data = await api.clients(token)
    setClients(data)
  }

  useEffect(() => {
    load().catch(() => setError('Nao foi possivel carregar clientes'))
  }, [token])

  const filtered = clients.filter((c) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return c.full_name.toLowerCase().includes(q) || c.phone.includes(q)
  })

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    if (!token) return
    setMessage('')
    setError('')
    try {
      await api.createClient(token, {
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        notes: form.notes.trim() || null,
      })
      setForm({ full_name: '', phone: '', email: '', notes: '' })
      setShowForm(false)
      setMessage('Cliente cadastrado')
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao cadastrar')
    }
  }

  return (
    <div className="space-y-5 lg:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold lg:text-2xl">Clientes</h2>
          <p className="mt-1 text-sm text-zinc-600 lg:text-base">Busque e abra a ficha com anamnese</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-xl bg-violet-700 px-4 py-2 text-sm font-medium text-white"
        >
          {showForm ? 'Fechar' : 'Novo'}
        </button>
      </div>

      <input
        type="search"
        placeholder="Buscar por nome ou telefone"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-xl border border-zinc-300 px-3 py-3 text-base lg:max-w-xl lg:px-4"
      />

      <div className={showForm ? 'lg:grid lg:grid-cols-[minmax(300px,380px)_1fr] lg:items-start lg:gap-8' : ''}>
      {showForm ? (
        <form onSubmit={handleCreate} className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm lg:p-6">
          <label className="block text-sm">
            Nome completo
            <input
              required
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Telefone
            <input
              required
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            E-mail (opcional)
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Observacoes
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2"
            />
          </label>
          <button type="submit" className="w-full rounded-xl bg-zinc-900 py-2.5 text-sm font-medium text-white">
            Salvar cliente
          </button>
        </form>
      ) : null}

      <div className={showForm ? 'mt-4 lg:mt-0' : ''}>
      {message ? <p className="text-sm text-green-700">{message}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3 lg:gap-3">
        {filtered.map((client) => (
          <li key={client.id}>
            <Link
              to={`/clientes/${client.id}`}
              className="flex h-full items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-4 shadow-sm transition hover:border-violet-200 hover:shadow-md lg:px-5"
            >
              <div>
                <p className="font-medium text-zinc-900">{client.full_name}</p>
                <p className="text-sm text-zinc-600">{client.phone}</p>
              </div>
              <span className="text-zinc-400">→</span>
            </Link>
          </li>
        ))}
      </ul>
      </div>
      </div>
    </div>
  )
}
