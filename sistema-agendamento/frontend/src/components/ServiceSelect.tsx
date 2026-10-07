import { BR_SERVICE_OPTIONS, findServiceByTitle, servicesGroupedByCategory } from '../data/services'

type Props = {
  value: string
  onChange: (title: string, defaultDurationMinutes?: number) => void
  className?: string
  required?: boolean
  allowLegacy?: boolean
}

export function ServiceSelect({ value, onChange, className = 'field-select mt-1', required, allowLegacy }: Props) {
  const groups = servicesGroupedByCategory()
  const known = findServiceByTitle(value)

  return (
    <select
      required={required}
      value={known ? value : allowLegacy && value ? value : ''}
      onChange={(e) => {
        const title = e.target.value
        const service = findServiceByTitle(title)
        onChange(title, service?.defaultDurationMinutes)
      }}
      className={className}
    >
      {!known && allowLegacy && value ? (
        <option value={value}>{value} (cadastro anterior)</option>
      ) : null}
      {!value && !required ? <option value="">Selecione</option> : null}
      {groups.map((group) => (
        <optgroup key={group.label} label={group.label}>
          {group.items.map((item) => (
            <option key={item.id} value={item.title}>
              {item.title}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}

/** Garante valor valido ao abrir formulario de edicao. */
export function normalizeServiceName(stored: string): string {
  if (findServiceByTitle(stored)) return stored
  const match = BR_SERVICE_OPTIONS.find((s) => s.title.toLowerCase() === stored.toLowerCase())
  return match?.title ?? stored
}
