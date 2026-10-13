import type { components } from '../api/schema'
import { severityRank, toSeverity, type Severity } from './severity'
import { humanizeKey, safeHttpUrl } from './raw'
import { parseFiles, type AffectedFile } from './affectedFiles'

export type { AffectedFile }

type RawFinding = components['schemas']['CodeVulnerabilityFinding']

export interface CodeVulnerability {
  id: string
  title: string
  severity: Severity | null
  cweId: string | null
  cvss: number | null
  masvs: string | null
  owaspMobile: string | null
  description: string | null
  referenceUrl: string | null
  files: AffectedFile[]
}

const CWE_PATTERN = /^\s*(CWE-\d+)\s*[:\-–·]?\s*(.*)$/i

function nonEmpty(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export function parseCwe(cwe: string | null | undefined): { id: string | null; name: string | null } {
  const value = nonEmpty(cwe)
  if (!value) return { id: null, name: null }
  const match = CWE_PATTERN.exec(value)
  if (!match) return { id: null, name: value }
  return { id: match[1]!.toUpperCase(), name: nonEmpty(match[2]) }
}

export function toCodeVulnerability(id: string, finding: RawFinding | null | undefined): CodeVulnerability {
  const metadata = finding?.metadata
  const cwe = parseCwe(metadata?.cwe)
  const cvss = metadata?.cvss
  return {
    id,
    title: cwe.name ?? humanizeKey(id),
    severity: toSeverity(metadata?.severity),
    cweId: cwe.id,
    cvss: typeof cvss === 'number' && cvss > 0 ? cvss : null,
    masvs: nonEmpty(metadata?.masvs),
    owaspMobile: nonEmpty(metadata?.['owasp-mobile']),
    description: nonEmpty(metadata?.description),
    referenceUrl: safeHttpUrl(metadata?.ref),
    files: parseFiles(finding?.files),
  }
}

export function toCodeVulnerabilities(
  raw: Record<string, RawFinding | null | undefined> | null | undefined,
): CodeVulnerability[] {
  return Object.entries(raw ?? {})
    .map(([id, finding]) => toCodeVulnerability(id, finding))
    .sort(
      (a, b) =>
        severityRank(b.severity) - severityRank(a.severity) || (b.cvss ?? 0) - (a.cvss ?? 0),
    )
}
