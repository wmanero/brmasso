import type { Appointment, Client, Dashboard, Payment } from '../types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`)
  if (!response.ok) {
    throw new Error(`Falha ao carregar ${path}`)
  }
  return response.json() as Promise<T>
}

export const api = {
  dashboard: () => request<Dashboard>('/dashboard'),
  clients: () => request<Client[]>('/clients'),
  appointments: () => request<Appointment[]>('/appointments'),
  payments: () => request<Payment[]>('/payments'),
}
