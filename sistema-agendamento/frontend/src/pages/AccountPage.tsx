import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api, ApiError } from '../lib/api'

export function AccountPage() {
  const { token, user, setUserProfile } = useAuth()
  const [fullName, setFullName] = useState('')
  const [calendarColor, setCalendarColor] = useState('#7c3aed')
  const [profileMessage, setProfileMessage] = useState('')
  const [profileError, setProfileError] = useState('')
  const [profileSubmitting, setProfileSubmitting] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)

  useEffect(() => {
    if (!user) return
    setFullName(user.full_name)
    setCalendarColor(user.calendar_color)
  }, [user])

  async function handleProfileSubmit(event: FormEvent) {
    event.preventDefault()
    if (!token) return
    setProfileMessage('')
    setProfileError('')
    setProfileSubmitting(true)
    try {
      const updated = await api.updateProfile(token, {
        full_name: fullName.trim(),
        calendar_color: calendarColor,
      })
      setUserProfile(updated)
      setProfileMessage('Perfil atualizado')
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.message : 'Nao foi possivel salvar o perfil')
    } finally {
      setProfileSubmitting(false)
    }
  }

  async function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault()
    if (!token) return
    setPasswordMessage('')
    setPasswordError('')
    if (newPassword !== confirmPassword) {
      setPasswordError('A nova senha e a confirmacao nao coincidem')
      return
    }
    setPasswordSubmitting(true)
    try {
      await api.changePassword(token, currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordMessage('Senha alterada com sucesso')
    } catch (err) {
      setPasswordError(err instanceof ApiError ? err.message : 'Nao foi possivel alterar a senha')
    } finally {
      setPasswordSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 lg:max-w-xl">
      <div>
        <h2 className="text-xl font-semibold lg:text-2xl">Minha conta</h2>
        <p className="mt-1 text-sm text-zinc-600 lg:text-base">E-mail de login: {user?.email}</p>
      </div>

      <form
        onSubmit={handleProfileSubmit}
        className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm lg:p-6"
      >
        <h3 className="font-semibold text-zinc-900">Meu perfil</h3>
        <p className="text-sm text-zinc-600">Nome e cor exibidos na agenda compartilhada.</p>
        <label className="block text-sm">
          Nome completo
          <input
            required
            minLength={2}
            maxLength={120}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-3"
          />
        </label>
        <label className="block text-sm">
          Cor na agenda
          <div className="mt-2 flex items-center gap-3">
            <input
              type="color"
              value={calendarColor}
              onChange={(e) => setCalendarColor(e.target.value)}
              className="h-11 w-14 cursor-pointer rounded-lg border border-zinc-300 bg-white p-1"
            />
            <input
              type="text"
              value={calendarColor}
              onChange={(e) => setCalendarColor(e.target.value)}
              pattern="^#[0-9A-Fa-f]{6}$"
              className="flex-1 rounded-xl border border-zinc-300 px-3 py-2 font-mono text-sm uppercase"
              aria-label="Codigo hexadecimal da cor"
            />
            <span
              className="h-10 w-10 shrink-0 rounded-full border border-zinc-200"
              style={{ backgroundColor: calendarColor }}
              aria-hidden
            />
          </div>
        </label>
        {profileMessage ? <p className="text-sm text-green-700">{profileMessage}</p> : null}
        {profileError ? <p className="text-sm text-red-600">{profileError}</p> : null}
        <button
          type="submit"
          disabled={profileSubmitting}
          className="w-full rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-white disabled:opacity-60 lg:max-w-xs"
        >
          {profileSubmitting ? 'Salvando…' : 'Salvar perfil'}
        </button>
      </form>

      <form
        onSubmit={handlePasswordSubmit}
        className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm lg:p-6"
      >
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
        {passwordMessage ? <p className="text-sm text-green-700">{passwordMessage}</p> : null}
        {passwordError ? <p className="text-sm text-red-600">{passwordError}</p> : null}
        <button
          type="submit"
          disabled={passwordSubmitting}
          className="w-full rounded-xl bg-violet-700 py-3 text-sm font-semibold text-white disabled:opacity-60 lg:max-w-xs"
        >
          {passwordSubmitting ? 'Salvando…' : 'Atualizar senha'}
        </button>
      </form>
    </div>
  )
}
