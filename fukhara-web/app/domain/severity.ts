import type { Translate } from './translate'

export type Severity = 'high' | 'warning' | 'info' | 'good'
export type PermissionStatus = 'dangerous' | 'normal' | 'unknown'
export type TagKind = 'red' | 'gold' | 'green' | 'gray'

const SEVERITY_KIND: Record<Severity, TagKind> = {
  high: 'red',
  warning: 'gold',
  info: 'gray',
  good: 'green',
}

const SEVERITY_RANK: Record<Severity, number> = {
  high: 3,
  warning: 2,
  info: 1,
  good: 0,
}

const PERMISSION_STATUS_KIND: Record<PermissionStatus, TagKind> = {
  dangerous: 'red',
  normal: 'gold',
  unknown: 'gray',
}

export function severityKind(severity: Severity | null | undefined): TagKind {
  if (!severity) return 'gray'
  return SEVERITY_KIND[severity] ?? 'gray'
}

export function severityRank(severity: Severity | null | undefined): number {
  if (!severity) return -1
  return SEVERITY_RANK[severity] ?? -1
}

export function permissionStatusKind(status: PermissionStatus | null | undefined): TagKind {
  if (!status) return 'gray'
  return PERMISSION_STATUS_KIND[status] ?? 'gray'
}

// Falls back to the raw value verbatim for anything unrecognized.
export function severityLabel(
  severity: Severity | string | null | undefined,
  t: Translate,
): string {
  const key = (severity ?? '').toString().toLowerCase()
  const map: Record<string, string> = {
    high: t('severity.high'),
    warning: t('severity.warning'),
    info: t('severity.info'),
    good: t('severity.good'),
  }
  return map[key] ?? (severity ?? '').toString()
}

export function permissionStatusLabel(
  status: PermissionStatus | string | null | undefined,
  t: Translate,
): string {
  const key = (status ?? '').toString().toLowerCase()
  const map: Record<string, string> = {
    dangerous: t('severity.dangerous'),
    normal: t('severity.normal'),
    unknown: t('severity.unknown'),
  }
  return map[key] ?? (status ?? '').toString()
}

const VERDICT_SEVERITY_KIND: Record<string, TagKind> = {
  high: 'red',
  medium: 'gold',
  low: 'green',
}

// VerdictResponse severity ("High" | "Medium" | "Low") is a different vocabulary from `Severity` above.
export function verdictSeverityKind(severity: string | null | undefined): TagKind {
  if (!severity) return 'gray'
  return VERDICT_SEVERITY_KIND[severity.toLowerCase()] ?? 'gray'
}

const SEVERITY_VALUES: readonly string[] = ['high', 'warning', 'info', 'good']

export function toSeverity(value: unknown): Severity | null {
  const key = typeof value === 'string' ? value.trim().toLowerCase() : ''
  return SEVERITY_VALUES.includes(key) ? (key as Severity) : null
}
