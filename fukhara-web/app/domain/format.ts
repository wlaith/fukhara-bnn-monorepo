// backend timestamps are ISO strings or zone-less "YYYY-MM-DD HH:MM:SS[.ffffff]".
// zone-less values parse as local time, so their wall-clock time is shown unchanged.
export function parseTimestamp(value: string): Date | null {
  const normalized = value.includes('T') ? value : value.replace(' ', 'T')
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date
}

const HAS_OFFSET = /(Z|[+-]\d{2}:?\d{2})$/i

export function formatTimestamp(value: string, locale: string, withTime = false): string {
  const date = parseTimestamp(value)
  if (!date) return value
  return new Intl.DateTimeFormat(`${locale}-u-nu-latn`, {
    ...(HAS_OFFSET.test(value.trim()) ? { timeZone: 'UTC' } : {}),
    dateStyle: 'medium',
    ...(withTime ? { timeStyle: 'short' } : {}),
  }).format(date)
}
