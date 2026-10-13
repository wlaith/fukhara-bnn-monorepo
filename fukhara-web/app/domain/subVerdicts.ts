import type { Severity, PermissionStatus, TagKind } from './severity'
import { severityKind, permissionStatusKind } from './severity'
import type { Translate } from './translate'

export interface SubVerdict {
  headline: string
  headlineKind?: TagKind
  tags: { label: string; kind: TagKind }[]
}

export interface VulnerabilityCategory {
  severity: Severity | null
}

export function codeAnalysisSubVerdict(
  categories: VulnerabilityCategory[],
  t: Translate,
): SubVerdict {
  const highCount = categories.filter((c) => c.severity === 'high').length
  const warningCount = categories.filter((c) => c.severity === 'warning').length
  const tags: SubVerdict['tags'] = []
  if (highCount > 0)
    tags.push({
      label: t('subVerdicts.codeAnalysis.highTag', { count: highCount }),
      kind: severityKind('high'),
    })
  if (warningCount > 0)
    tags.push({
      label: t('subVerdicts.codeAnalysis.warningTag', { count: warningCount }),
      kind: severityKind('warning'),
    })
  if (tags.length === 0) tags.push({ label: t('subVerdicts.codeAnalysis.noIssues'), kind: 'green' })
  return {
    headline: t('subVerdicts.codeAnalysis.headline', { count: highCount + warningCount }),
    headlineKind: highCount > 0 ? 'red' : warningCount > 0 ? 'gold' : 'gray',
    tags,
  }
}

export interface PermissionEntry {
  status: PermissionStatus | null
}

export function behaviorAnalysisSubVerdict(
  permissions: PermissionEntry[],
  t: Translate,
): SubVerdict {
  const dangerous = permissions.filter((p) => p.status === 'dangerous').length
  const moderate = permissions.filter((p) => p.status === 'normal').length
  const unclassified = permissions.filter((p) => p.status === 'unknown').length
  const tags: SubVerdict['tags'] = []
  if (moderate > 0)
    tags.push({
      label: t('subVerdicts.behaviorAnalysis.moderateTag', { count: moderate }),
      kind: permissionStatusKind('normal'),
    })
  if (unclassified > 0)
    tags.push({
      label: t('subVerdicts.behaviorAnalysis.unclassifiedTag', { count: unclassified }),
      kind: permissionStatusKind('unknown'),
    })
  return {
    headline: t('subVerdicts.behaviorAnalysis.headline', { count: dangerous }),
    headlineKind: dangerous > 0 ? 'red' : 'gray',
    tags,
  }
}

export interface ManifestFinding {
  severity: Severity | null
}

export function appInformationSubVerdict(findings: ManifestFinding[], t: Translate): SubVerdict {
  const critical = findings.filter((f) => f.severity === 'high').length
  const moderate = findings.filter((f) => f.severity === 'warning').length
  const low = findings.filter((f) => f.severity === 'info').length
  const tags: SubVerdict['tags'] = []
  if (moderate > 0)
    tags.push({
      label: t('subVerdicts.appInformation.moderateTag', { count: moderate }),
      kind: severityKind('warning'),
    })
  if (low > 0)
    tags.push({
      label: t('subVerdicts.appInformation.lowTag', { count: low }),
      kind: severityKind('info'),
    })
  return {
    headline: t('subVerdicts.appInformation.headline', { count: critical }),
    headlineKind: critical > 0 ? 'red' : 'gray',
    tags,
  }
}

export function threatIntelligenceSubVerdict(
  yaraMatchCount: number,
  avDetectionCount: number,
  virusTotalAvailable: boolean,
  t: Translate,
): SubVerdict {
  const total = yaraMatchCount + avDetectionCount
  const tags: SubVerdict['tags'] = [
    yaraMatchCount > 0
      ? {
          label: t('subVerdicts.threatIntelligence.yaraTag', { count: yaraMatchCount }),
          kind: 'red',
        }
      : { label: t('subVerdicts.threatIntelligence.noYaraTag'), kind: 'green' },
    avDetectionCount > 0
      ? {
          label: t('subVerdicts.threatIntelligence.avTag', { count: avDetectionCount }),
          kind: 'red',
        }
      : virusTotalAvailable
        ? { label: t('subVerdicts.threatIntelligence.notDetectedTag'), kind: 'green' }
        : { label: t('subVerdicts.threatIntelligence.avUnavailableTag'), kind: 'gray' },
  ]
  return {
    headline:
      total === 0
        ? t('subVerdicts.threatIntelligence.noDetections')
        : t('subVerdicts.threatIntelligence.flaggedHeadline', { count: total }),
    tags,
  }
}

export interface DomainEntry {
  bad: string | null
  ofac?: boolean | null
}

export function networkSubVerdict(domains: DomainEntry[], t: Translate): SubVerdict {
  const badCount = domains.filter((d) => d.bad != null && d.bad !== 'no').length
  const ofacCount = domains.filter((d) => d.ofac === true).length
  const tags: SubVerdict['tags'] = []
  if (ofacCount > 0)
    tags.push({ label: t('subVerdicts.network.ofacTag', { count: ofacCount }), kind: 'red' })
  return {
    headline:
      badCount === 0
        ? t('subVerdicts.network.noBadDomains')
        : t('subVerdicts.network.badDomainsHeadline', { count: badCount }),
    headlineKind: badCount === 0 ? 'green' : 'red',
    tags,
  }
}

export const FLAGGED_CATEGORIES = [
  'manipulator',
  'anti_debug',
  'anti_vm',
  'obfuscator',
  'protector',
] as const
type FlaggedCategory = (typeof FLAGGED_CATEGORIES)[number]

export interface ApkidFileMatches {
  matches: Partial<Record<FlaggedCategory | 'compiler', string[]>> | null
}

// Shared by the summary card and the detail view so the flagged-category list stays in sync.
export function flaggedIdentifierPairs(files: ApkidFileMatches[]): string[] {
  const flagged = new Set<string>()
  for (const file of files) {
    if (!file.matches) continue
    for (const category of FLAGGED_CATEGORIES) {
      const values = file.matches[category]
      if (!values) continue
      for (const value of values) flagged.add(`${category}:${value}`)
    }
  }
  return [...flagged]
}

export function categoryLabel(category: string, t: Translate): string {
  const map: Record<string, string> = {
    manipulator: t('subVerdicts.categories.manipulator'),
    anti_debug: t('subVerdicts.categories.antiDebug'),
    anti_vm: t('subVerdicts.categories.antiVm'),
    obfuscator: t('subVerdicts.categories.obfuscator'),
    protector: t('subVerdicts.categories.protector'),
  }
  return map[category] ?? capitalize(category)
}

export function fingerprintsSubVerdict(files: ApkidFileMatches[], t: Translate): SubVerdict {
  const flagged = flaggedIdentifierPairs(files)
  const tags = flagged.slice(0, 2).map((pair) => {
    const [category, value] = pair.split(':')
    return { label: `${categoryLabel(category ?? '', t)}: ${value}`, kind: 'gold' as TagKind }
  })
  return {
    headline: t('subVerdicts.fingerprints.headline', { count: flagged.length }),
    tags,
  }
}

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
