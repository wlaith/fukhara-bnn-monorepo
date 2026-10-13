import { asArray, asBoolean, asRecord, asText, asTextList } from './raw'

export interface Domain {
  id: string
  name: string
  malicious: boolean | null
  ofac: boolean | null
  ip: string | null
  location: string | null
  country: string | null
  coordinates: string | null
}

function riskRank(domain: Domain): number {
  return (domain.malicious ? 2 : 0) + (domain.ofac ? 1 : 0)
}

export function toDomains(raw: unknown): Domain[] {
  return Object.entries(asRecord(raw))
    .map(([name, value]) => {
      const info = asRecord(value)
      const geo = asRecord(info.geolocation)
      const bad = asText(info.bad)?.toLowerCase()
      const latitude = asText(geo.latitude)
      const longitude = asText(geo.longitude)
      // MobSF reports "0.000000" for unknown coordinates.
      const hasCoordinates =
        latitude !== null && longitude !== null && !(Number(latitude) === 0 && Number(longitude) === 0)
      const country = asText(geo.country_long)
      const parts = [asText(geo.city), asText(geo.region), country].filter((part): part is string => part !== null)
      const location = [...new Set(parts)].join(', ')
      return {
        id: name,
        name,
        malicious: bad === 'yes' ? true : bad === 'no' ? false : null,
        ofac: asBoolean(info.ofac),
        ip: asText(geo.ip),
        location: location || null,
        country,
        coordinates: hasCoordinates ? `${latitude}, ${longitude}` : null,
      }
    })
    .sort((a, b) => riskRank(b) - riskRank(a) || a.name.localeCompare(b.name))
}

export interface UrlGroup {
  id: string
  path: string | null
  urls: string[]
}

export function toUrlGroups(raw: unknown): UrlGroup[] {
  return asArray(raw)
    .map((entry, index) => {
      const record = asRecord(entry)
      const path = asText(record.path)
      return { id: `${path ?? 'unknown'}-${index}`, path, urls: [...new Set(asTextList(record.urls))] }
    })
    .filter((group) => group.urls.length > 0)
    .sort((a, b) => b.urls.length - a.urls.length || (a.path ?? '').localeCompare(b.path ?? ''))
}

export function countUrls(groups: UrlGroup[]): number {
  return groups.reduce((sum, group) => sum + group.urls.length, 0)
}
