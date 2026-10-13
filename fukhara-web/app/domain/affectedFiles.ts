import { asRecord, asText } from './raw'

export interface AffectedFile {
  path: string
  lines: string[]
}

export function parseFiles(files: unknown): AffectedFile[] {
  return Object.entries(asRecord(files)).map(([path, lines]) => ({
    path,
    lines: (asText(lines) ?? '')
      .split(',')
      .map((line) => line.trim())
      .filter(Boolean),
  }))
}
