import type { Appointment, Client, Dashboard, Payment } from '../types'

export const fallbackDashboard: Dashboard = {
  clients_total: 2,
  active_packages: 1,
  monthly_revenue: 240,
  upcoming_appointments: 2,
  google_form_url: 'https://forms.gle/exemplo',
  calendar_id: 'primary',
  pix_key: 'contato@brmassoterapia.com',
}

export const fallbackClients: Client[] = [
  {
    id: 1,
    full_name: 'Ana Paula Lima',
    phone: '(11) 99876-1020',
    email: 'ana@example.com',
    instagram_handle: '@anapaulalima',
    preferred_service: 'Massagem relaxante',
    notes: 'Busca alivio para tensao cervical.',
    has_active_package: true,
    created_at: '2026-04-16T10:00:00',
    anamneses: [
      {
        id: 1,
        summary: 'Dor recorrente em trapezio e lombar.',
        pain_points: 'Cervical, ombros e lombar.',
        contraindications: 'Nenhuma.',
        submitted_at: '2026-04-10T09:00:00',
      },
    ],
    plans: [
      {
        id: 1,
        title: 'Pacote Relax Premium',
        session_type: 'Pacote',
        sessions_total: 8,
        sessions_remaining: 5,
        price_total: 960,
        active: true,
      },
    ],
  },
]

export const fallbackAppointments: Appointment[] = [
  {
    id: 1,
    client_id: 1,
    service_name: 'Sessao Relax Premium',
    scheduled_at: '2026-04-20T14:00:00',
    duration_minutes: 75,
    status: 'confirmed',
    notes: 'Foco em cervical e lombar',
    calendar_event_id: 'cal_evt_001',
  },
]

export const fallbackPayments: Payment[] = [
  {
    id: 1,
    client_id: 1,
    amount: 240,
    method: 'pix',
    status: 'paid',
    description: 'Entrada pacote relax',
    external_reference: 'pix_abc123',
    created_at: '2026-04-16T08:00:00',
  },
]
