import { asArray, asRecord, asText, asTextList } from './raw'
import { parseTimestamp } from './format'

export interface YaraMatch {
  id: string
  source: string | null
  rules: string[]
}

export function toYaraMatches(raw: unknown): YaraMatch[] {
  return asArray(asRecord(raw).matches)
    .map((entry, index) => {
      const record = asRecord(entry)
      const source = asText(record.source)
      return { id: `${source ?? 'unknown'}-${index}`, source, rules: asTextList(record.rules) }
    })
    .filter((match) => match.rules.length > 0)
}

export interface AvDetection {
  name: string
  count: number
}

export function toAvDetections(raw: unknown): AvDetection[] {
  return asArray(raw)
    .flatMap((entry) => Object.entries(asRecord(entry)))
    .map(([name, count]) => ({ name, count: typeof count === 'number' ? count : Number(count) || 0 }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}

export const TIMELINE_KEYS = [
  'oldest_file_found_in_apk',
  'latest_file_found_in_apk',
  'certificate_valid_not_before',
  'certificate_valid_not_after',
  'first_submission_on_vt',
  'last_submission_on_vt',
  'upload_on_fukhara',
] as const

export type TimelineKey = (typeof TIMELINE_KEYS)[number]

export interface TimelineEvent {
  key: TimelineKey
  value: string
  date: Date | null
}

export function toTimeline(raw: unknown): TimelineEvent[] {
  const record = asRecord(raw)
  return TIMELINE_KEYS.flatMap((key) => {
    const value = asText(record[key])
    return value ? [{ key, value, date: parseTimestamp(value) }] : []
  }).sort((a, b) => {
    if (a.date && b.date) return a.date.getTime() - b.date.getTime()
    if (a.date) return -1
    if (b.date) return 1
    return 0
  })
}

export interface ExternalReports {
  virusTotal: string | null
  malwareBazaar: string | null
}

// The API returns VirusTotal's API URL (.../api/v3/files/<sha256>); link to the web report instead.
export function toExternalReports(raw: unknown): ExternalReports {
  const record = asRecord(raw)
  const vtSha256 = /\/files\/([a-f0-9]{64})\b/i.exec(asText(record.virustotal) ?? '')?.[1]
  const mbSha256 = /\/sample\/([a-f0-9]{64})\b/i.exec(asText(record.malwarebazaar) ?? '')?.[1]
  return {
    virusTotal: vtSha256 ? `https://www.virustotal.com/gui/file/${vtSha256.toLowerCase()}` : null,
    malwareBazaar: mbSha256 ? `https://bazaar.abuse.ch/sample/${mbSha256.toLowerCase()}` : null,
  }
}

export function virusTotalAvailable(thirdPartyApps: unknown, avDetections: unknown): boolean {
  return toExternalReports(thirdPartyApps).virusTotal !== null || toAvDetections(avDetections).length > 0
}
