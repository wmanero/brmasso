import type { FormEvent } from 'react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api, ApiError } from '../lib/api'

export function AccountPage() {
  const { token, user } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!token) return
    setMessage('')
    setError('')
    if (newPassword !== confirmPassword) {
      setError('A nova senha e a confirmacao nao coincidem')
      return
    }
    setSubmitting(true)
    try {
      await api.changePassword(token, currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setMessage('Senha alterada com sucesso')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Nao foi possivel alterar a senha')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 lg:max-w-xl">
      <div>
        <h2 className="text-xl font-semibold lg:text-2xl">Minha conta</h2>
        <p className="mt-1 text-sm text-zinc-600 lg:text-base">
          {user?.full_name} · {user?.email}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm lg:p-6">
        <h3 className="font-semibold text-zinc-900">Alterar senha</h3>
        <label className="block text-sm">
          Senha atual
          <input
            type="password"
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-3"
          />
        </label>
        <label className="block text-sm">
          Nova senha
          <input
            type="password"
            required
            minLength={4}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-3"
          />
        </label>
        <label className="block text-sm">
          Confirmar nova senha
          <input
            type="password"
            required
            minLength={4}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-3"
          />
        </label>
        {message ? <p className="text-sm text-green-700">{message}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-violet-700 py-3 text-sm font-semibold text-white disabled:opacity-60 lg:max-w-xs"
        >
          {submitting ? 'Salvando…' : 'Atualizar senha'}
        </button>
      </form>
    </div>
  )
}
