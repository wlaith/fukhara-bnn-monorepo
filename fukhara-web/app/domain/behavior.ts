import { asArray, asRecord, asText, humanizeKey } from './raw'
import { parseFiles, type AffectedFile } from './affectedFiles'
import { severityRank, toSeverity, type PermissionStatus, type Severity, type TagKind } from './severity'

export interface Permission {
  id: string
  name: string
  summary: string | null
  description: string | null
  status: PermissionStatus
  rawStatus: string | null
}

const STATUS_ORDER: Record<PermissionStatus, number> = { dangerous: 0, normal: 1, unknown: 2 }

function toStatus(value: string | null): PermissionStatus {
  return value === 'dangerous' || value === 'normal' ? value : 'unknown'
}

export function toPermissions(raw: unknown): Permission[] {
  return Object.entries(asRecord(raw))
    .map(([name, value]) => {
      const info = asRecord(value)
      const rawStatus = asText(info.status)?.toLowerCase() ?? null
      return {
        id: name,
        name,
        summary: asText(info.info),
        description: asText(info.description),
        status: toStatus(rawStatus),
        rawStatus,
      }
    })
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.name.localeCompare(b.name))
}

export interface Behaviour {
  id: string
  crime: string
  confidence: number | null
}

function parseConfidence(value: unknown): number | null {
  const match = /^(\d{1,3})\s*%?$/.exec(asText(value) ?? '')
  return match ? Math.min(100, Number(match[1])) : null
}

// Quark can list the same crime more than once; keep its strongest match.
export function toBehaviours(raw: unknown): Behaviour[] {
  const byCrime = new Map<string, Behaviour>()
  for (const entry of asArray(raw)) {
    const record = asRecord(entry)
    const crime = asText(record.crime)
    if (!crime) continue
    const confidence = parseConfidence(record.confidence)
    const existing = byCrime.get(crime)
    if (!existing || (confidence ?? -1) > (existing.confidence ?? -1)) {
      byCrime.set(crime, { id: crime, crime, confidence })
    }
  }
  return [...byCrime.values()].sort(
    (a, b) => (b.confidence ?? -1) - (a.confidence ?? -1) || a.crime.localeCompare(b.crime),
  )
}

export function confidenceKind(confidence: number | null): TagKind {
  if (confidence === null) return 'gray'
  if (confidence >= 100) return 'red'
  if (confidence >= 60) return 'gold'
  return 'gray'
}

export interface ApiUsage {
  id: string
  title: string
  severity: Severity | null
  files: AffectedFile[]
}

export function toApiUsages(raw: unknown): ApiUsage[] {
  return Object.entries(asRecord(raw))
    .map(([id, value]) => {
      const finding = asRecord(value)
      const metadata = asRecord(finding.metadata)
      return {
        id,
        title: asText(metadata.description) ?? humanizeKey(id.replace(/^api_/, '')),
        severity: toSeverity(metadata.severity),
        files: parseFiles(finding.files),
      }
    })
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity) || b.files.length - a.files.length)
}
