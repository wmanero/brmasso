export type Dashboard = {
  clients_total: number
  active_packages: number
  monthly_revenue: number
  upcoming_appointments: number
  google_form_url: string
  calendar_id: string
  pix_key: string
}

export type Anamnesis = {
  id: number
  summary: string
  pain_points: string
  contraindications?: string | null
  submitted_at: string
}

export type TreatmentPlan = {
  id: number
  title: string
  session_type: string
  sessions_total: number
  sessions_remaining: number
  price_total: number
  valid_until?: string | null
  active: boolean
}

export type Client = {
  id: number
  full_name: string
  phone: string
  email?: string | null
  instagram_handle?: string | null
  birth_date?: string | null
  preferred_service?: string | null
  notes?: string | null
  has_active_package: boolean
  created_at: string
  anamneses: Anamnesis[]
  plans: TreatmentPlan[]
}

export type Appointment = {
  id: number
  client_id: number
  service_name: string
  scheduled_at: string
  duration_minutes: number
  status: string
  notes?: string | null
  calendar_event_id?: string | null
}

export type Payment = {
  id: number
  client_id: number
  amount: number
  method: string
  status: string
  description: string
  external_reference?: string | null
  created_at: string
}
