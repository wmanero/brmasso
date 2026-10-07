import { joinDatetimeLocal, splitDatetimeLocal, todayDateInputValue } from '../lib/datetime'

type Props = {
  value: string
  onChange: (value: string) => void
  minDate?: string
}

export function AppointmentDateTimeFields({ value, onChange, minDate = todayDateInputValue() }: Props) {
  const { date, time } = splitDatetimeLocal(value)

  return (
    <div className="contents">
      <label className="block text-sm">
        Data
        <input
          type="date"
          required
          min={minDate}
          value={date}
          onChange={(e) => onChange(joinDatetimeLocal(e.target.value, time))}
          className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-3 text-base"
        />
      </label>
      <label className="block text-sm">
        Horario
        <input
          type="time"
          required
          value={time}
          step={60}
          onChange={(e) => onChange(joinDatetimeLocal(date, e.target.value))}
          className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-3 text-base"
        />
      </label>
    </div>
  )
}
