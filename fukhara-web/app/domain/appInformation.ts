import { asArray, asRecord, asText, asTextList, humanizeKey } from './raw'
import { parseTimestamp } from './format'
import { severityRank, toSeverity, type Severity } from './severity'

export interface SignatureScheme {
  version: number
  enabled: boolean
}

export interface AppDetails {
  appName: string | null
  packageName: string | null
  versionName: string | null
  versionCode: number | null
  minSdk: string | null
  maxSdk: string | null
  signed: boolean | null
  signatureSchemes: SignatureScheme[]
}

// sdk is "<min> - <max>"; Python writes "None" for a missing bound.
function sdkBound(value: string | undefined): string | null {
  const bound = value?.trim()
  return bound && bound !== 'None' ? bound : null
}

export function toAppDetails(raw: unknown): AppDetails | null {
  const record = asRecord(raw)
  if (Object.values(record).every((value) => value === null || value === undefined)) return null
  const [min, max] = (asText(record.sdk) ?? '').split(' - ')
  const signature = asText(record.signature) ?? ''
  const signedLine = /^Binary is (not )?signed/im.exec(signature)
  const schemes = [...signature.matchAll(/^v(\d) signature:\s*(True|False)\s*$/gim)].map((match) => ({
    version: Number(match[1]),
    enabled: match[2]!.toLowerCase() === 'true',
  }))
  return {
    appName: asText(record.app_name),
    packageName: asText(record.package),
    versionName: asText(record.version_name),
    versionCode: typeof record.version_code === 'number' && record.version_code >= 0 ? record.version_code : null,
    minSdk: sdkBound(min),
    maxSdk: sdkBound(max),
    signed: signedLine ? !signedLine[1] : null,
    signatureSchemes: schemes,
  }
}

export type CertificateValidity = 'valid' | 'expired' | 'not-yet-valid'

export interface Certificate {
  issuer: string | null
  notBefore: string | null
  notAfter: string | null
  validity: CertificateValidity | null
  md5: string | null
  sha1: string | null
  sha256: string | null
}

export function toCertificate(raw: unknown, now: Date): Certificate | null {
  const record = asRecord(raw)
  if (!Object.values(record).some((value) => asText(value) !== null)) return null
  const notBefore = asText(record.not_before)
  const notAfter = asText(record.not_after)
  const from = notBefore ? parseTimestamp(notBefore) : null
  const to = notAfter ? parseTimestamp(notAfter) : null
  let validity: CertificateValidity | null = null
  if (from && to) validity = now < from ? 'not-yet-valid' : now > to ? 'expired' : 'valid'
  return {
    issuer: asText(record.issuer),
    notBefore,
    notAfter,
    validity,
    md5: asText(record.md5),
    sha1: asText(record.sha1),
    sha256: asText(record.sha256),
  }
}

export interface AppComponents {
  mainActivity: string | null
  activities: string[]
  receivers: string[]
  services: string[]
}

export function toComponents(activities: unknown, receivers: unknown, services: unknown): AppComponents {
  const record = asRecord(activities)
  return {
    mainActivity: asText(record.main_activity),
    activities: asTextList(record.all_activities),
    receivers: asTextList(receivers),
    services: asTextList(services),
  }
}

export interface ManifestFinding {
  id: string
  title: string
  description: string | null
  severity: Severity | null
  components: string[]
}

// manifest_analysis is {} (not []) when MobSF fails; asArray turns that into [].
export function toManifestFindings(raw: unknown): ManifestFinding[] {
  return asArray(raw)
    .map((entry, index) => {
      const record = asRecord(entry)
      const rule = asText(record.rule)
      return {
        id: `${rule ?? 'finding'}-${index}`,
        title: asText(record.title) ?? asText(record.name) ?? humanizeKey(rule ?? ''),
        description: asText(record.description),
        severity: toSeverity(record.severity),
        components: asTextList(record.component),
      }
    })
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity))
}
