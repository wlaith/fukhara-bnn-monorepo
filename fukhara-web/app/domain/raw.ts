export type UnknownRecord = Record<string, unknown>

export function asRecord(value: unknown): UnknownRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {}
}

export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

// Scanners use "" and "-" for "no value".
export function asText(value: unknown): string | null {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed && trimmed !== '-' ? trimmed : null
}

export function asTextList(value: unknown): string[] {
  return asArray(value)
    .map(asText)
    .filter((item): item is string => item !== null)
}

export function asBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null
}

// "android_logging" -> "Android logging"
export function humanizeKey(key: string): string {
  const words = key.replace(/[_-]+/g, ' ').trim()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

// URLs come from scanner output, so only http(s) links are ever rendered.
export function safeHttpUrl(value: unknown): string | null {
  const candidate = asText(value)
  if (!candidate) return null
  try {
    const url = new URL(candidate)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null
  } catch {
    return null
  }
}
