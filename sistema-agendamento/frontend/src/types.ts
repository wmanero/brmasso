export type User = {
  id: number
  full_name: string
  email: string
  calendar_color: string
}

export type Client = {
  id: number
  full_name: string
  phone: string
  email: string | null
  notes: string | null
  created_at: string
}

export type Anamnesis = {
  id: number
  client_id: number
  summary: string
  pain_points: string
  contraindications: string | null
  submitted_at: string
  created_by_user_id: number | null
}

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled'

export type Appointment = {
  id: number
  client_id: number
  therapist_id: number
  service_name: string
  starts_at: string
  duration_minutes: number
  status: AppointmentStatus
  notes: string | null
  client_name?: string | null
  therapist_name?: string | null
  therapist_color?: string | null
}
