import type { Anamnesis, Appointment, Client, User } from '../types'

const API_PREFIX = import.meta.env.VITE_API_PREFIX ?? '/api/v1'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init: RequestInit = {}, token?: string | null): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_PREFIX}${path}`, { ...init, headers })
  if (!response.ok) {
    let detail = 'Erro na requisicao'
    try {
      const data = (await response.json()) as { detail?: string }
      if (typeof data.detail === 'string') detail = data.detail
    } catch {
      /* ignore */
    }
    throw new ApiError(response.status, detail)
  }
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export const api = {
  login(email: string, password: string) {
    return request<{ access_token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },
  me(token: string) {
    return request<User>('/auth/me', {}, token)
  },
  therapists(token: string) {
    return request<User[]>('/therapists', {}, token)
  },
  clients(token: string) {
    return request<Client[]>('/clients', {}, token)
  },
  createClient(token: string, payload: Omit<Client, 'id' | 'created_at'>) {
    return request<Client>('/clients', { method: 'POST', body: JSON.stringify(payload) }, token)
  },
  client(token: string, id: number) {
    return request<Client>(`/clients/${id}`, {}, token)
  },
  anamneses(token: string, clientId: number) {
    return request<Anamnesis[]>(`/clients/${clientId}/anamneses`, {}, token)
  },
  createAnamnesis(
    token: string,
    clientId: number,
    payload: Pick<Anamnesis, 'summary' | 'pain_points' | 'contraindications'>,
  ) {
    return request<Anamnesis>(
      `/clients/${clientId}/anamneses`,
      { method: 'POST', body: JSON.stringify(payload) },
      token,
    )
  },
  appointments(token: string, params?: { from?: string; to?: string; therapist_id?: number }) {
    const search = new URLSearchParams()
    if (params?.from) search.set('from', params.from)
    if (params?.to) search.set('to', params.to)
    if (params?.therapist_id) search.set('therapist_id', String(params.therapist_id))
    const qs = search.toString()
    return request<Appointment[]>(`/appointments${qs ? `?${qs}` : ''}`, {}, token)
  },
  createAppointment(token: string, payload: Omit<Appointment, 'id' | 'client_name' | 'therapist_name' | 'therapist_color'>) {
    return request<Appointment>('/appointments', { method: 'POST', body: JSON.stringify(payload) }, token)
  },
  appointment(token: string, id: number) {
    return request<Appointment>(`/appointments/${id}`, {}, token)
  },
  updateAppointment(token: string, id: number, payload: Partial<Appointment>) {
    return request<Appointment>(`/appointments/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }, token)
  },
  changePassword(token: string, current_password: string, new_password: string) {
    return request<void>(
      '/auth/change-password',
      { method: 'POST', body: JSON.stringify({ current_password, new_password }) },
      token,
    )
  },
}
