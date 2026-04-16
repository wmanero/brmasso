import type {
  Appointment,
  AppointmentCreatePayload,
  Client,
  ClientCreatePayload,
  Dashboard,
  LoginPayload,
  Payment,
  PaymentCreatePayload,
  Token,
} from '../types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `Falha ao carregar ${path}`)
  }
  return response.json() as Promise<T>
}

export const api = {
  login: (payload: LoginPayload) =>
    request<Token>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  dashboard: () => request<Dashboard>('/dashboard'),
  clients: () => request<Client[]>('/clients'),
  createClient: (payload: ClientCreatePayload) =>
    request<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  appointments: () => request<Appointment[]>('/appointments'),
  createAppointment: (payload: AppointmentCreatePayload) =>
    request<Appointment>('/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  payments: () => request<Payment[]>('/payments'),
  createPayment: (payload: PaymentCreatePayload) =>
    request<Payment>('/payments', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}
