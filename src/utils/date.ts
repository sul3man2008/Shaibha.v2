export function parseDisplayDate(value?: string | null): Date | null {
  if (!value) return null

  const trimmed = String(value).trim()
  if (!trimmed) return null

  const normalizedValue = /^\d{4}-\d{2}-\d{2}$/.test(trimmed)
    ? `${trimmed}T12:00:00`
    : trimmed

  const parsed = new Date(normalizedValue)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function formatDisplayDate(value?: string | null, fallback = '—') {
  const parsed = parseDisplayDate(value)
  if (!parsed) return fallback

  return parsed.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDisplayDateTime(value?: string | null, fallback = '—') {
  const parsed = parseDisplayDate(value)
  if (!parsed) return fallback

  return parsed.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getDateInputValue(value?: string | null) {
  const parsed = parseDisplayDate(value)
  if (!parsed) return new Date().toISOString().slice(0, 10)
  return parsed.toISOString().slice(0, 10)
}

export function getDateTimestamp(value?: string | null) {
  const parsed = parseDisplayDate(value)
  return parsed ? parsed.getTime() : 0
}
