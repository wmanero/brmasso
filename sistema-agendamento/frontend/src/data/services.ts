/** Alinhado a landing_page/services-data.js (titulos e categorias). */
export type ServiceOption = {
  id: string
  category: string
  title: string
  defaultDurationMinutes: number
}

export const SERVICE_CATEGORIES = [
  { id: 'massagens', label: 'Massagens' },
  { id: 'terapias', label: 'Terapias Corporais' },
  { id: 'relaxamento', label: 'Relaxamento' },
] as const

export const BR_SERVICE_OPTIONS: ServiceOption[] = [
  { id: 'relaxante', category: 'massagens', title: 'Massagem Relaxante', defaultDurationMinutes: 50 },
  { id: 'terapeutica', category: 'massagens', title: 'Massagem Terapêutica', defaultDurationMinutes: 50 },
  { id: 'quick', category: 'massagens', title: 'Quick Massage', defaultDurationMinutes: 30 },
  { id: 'pedras', category: 'massagens', title: 'Pedras Quentes', defaultDurationMinutes: 50 },
  { id: 'linfatica', category: 'terapias', title: 'Drenagem Linfática', defaultDurationMinutes: 50 },
  { id: 'shiatsu', category: 'terapias', title: 'Shiatsu', defaultDurationMinutes: 50 },
  { id: 'miofascial', category: 'terapias', title: 'Liberação Miofascial', defaultDurationMinutes: 50 },
  { id: 'quiro', category: 'terapias', title: 'Quiroterapia', defaultDurationMinutes: 50 },
  { id: 'reflexologia', category: 'relaxamento', title: 'Reflexologia', defaultDurationMinutes: 40 },
  { id: 'bioenergetica', category: 'relaxamento', title: 'Bioenergética', defaultDurationMinutes: 50 },
  { id: 'spa-pes', category: 'relaxamento', title: 'SPA dos Pés', defaultDurationMinutes: 40 },
]

export const DEFAULT_SERVICE_TITLE = BR_SERVICE_OPTIONS[0].title

export function findServiceByTitle(title: string): ServiceOption | undefined {
  return BR_SERVICE_OPTIONS.find((s) => s.title === title)
}

export function servicesGroupedByCategory(): { label: string; items: ServiceOption[] }[] {
  return SERVICE_CATEGORIES.map((cat) => ({
    label: cat.label,
    items: BR_SERVICE_OPTIONS.filter((s) => s.category === cat.id),
  })).filter((group) => group.items.length > 0)
}
