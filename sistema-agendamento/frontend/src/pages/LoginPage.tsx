import type { FormEvent } from 'react'
import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../lib/api'

export function LoginPage() {
  const { login, token, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && token) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email.trim(), password)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Nao foi possivel entrar')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-violet-50 to-zinc-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:max-w-md lg:p-8"
      >
        <p className="text-xs font-medium uppercase tracking-wide text-violet-700">Uso interno</p>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-900">Entrar na agenda</h1>
        <p className="mt-2 text-sm text-zinc-600">Massoterapeutas Barbará Rodrigues</p>

        <label className="mt-6 block text-sm font-medium text-zinc-700">
          E-mail
          <input
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-3 text-base outline-none focus:border-violet-500"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-zinc-700">
          Senha
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-3 text-base outline-none focus:border-violet-500"
          />
        </label>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-xl bg-violet-700 px-4 py-3 text-base font-semibold text-white disabled:opacity-60"
        >
          {submitting ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
