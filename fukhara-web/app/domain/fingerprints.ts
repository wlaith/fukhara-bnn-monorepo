import { asArray, asRecord, asText, asTextList } from './raw'
import { FLAGGED_CATEGORIES } from './subVerdicts'

export interface IdentifiedFile {
  id: string
  filename: string | null
  matches: { category: string; value: string }[]
}

// APKiD names entries inside the APK "<apk>!classes.dex"; the bare "<sha>.apk" entry is the APK itself.
function displayFilename(filename: string | null): string | null {
  if (!filename) return null
  const inner = filename.split('!').pop() ?? filename
  return inner === filename && filename.toLowerCase().endsWith('.apk') ? null : inner
}

// identifiers.apkid.files is APKiD's raw JSON ({ apkid_version, files: [...] }), or the string "{}" when APKiD failed.
export function toIdentifiedFiles(raw: unknown): IdentifiedFile[] {
  const files = asArray(asRecord(asRecord(asRecord(raw).apkid).files).files)
  return files
    .map((entry, index) => {
      const record = asRecord(entry)
      const matches = asRecord(record.matches)
      return {
        id: `${asText(record.filename) ?? 'file'}-${index}`,
        filename: displayFilename(asText(record.filename)),
        matches: FLAGGED_CATEGORIES.flatMap((category) =>
          asTextList(matches[category]).map((value) => ({ category, value })),
        ),
      }
    })
    .filter((file) => file.matches.length > 0)
}

export interface FuzzyHash {
  id: string
  filename: string | null
  hash: string
}

export function toFuzzyHashes(raw: unknown): FuzzyHash[] {
  return asArray(asRecord(raw).ssdeep).flatMap((entry, index) => {
    const record = asRecord(entry)
    const hash = asText(record.fuzzy_hash)
    return hash ? [{ id: `ssdeep-${index}`, filename: asText(record.filename), hash }] : []
  })
}
