import { describe, it, expect } from 'vitest'
import * as subVerdicts from './subVerdicts'
import i18n from '~/test-utils/i18n'
import { withTestT } from '~/test-utils/translate'
import type { Translate } from '~/domain/translate'

const codeAnalysisSubVerdict = withTestT(subVerdicts.codeAnalysisSubVerdict)
const behaviorAnalysisSubVerdict = withTestT(subVerdicts.behaviorAnalysisSubVerdict)
const appInformationSubVerdict = withTestT(subVerdicts.appInformationSubVerdict)
const threatIntelligenceSubVerdict = withTestT(subVerdicts.threatIntelligenceSubVerdict)
const networkSubVerdict = withTestT(subVerdicts.networkSubVerdict)
const fingerprintsSubVerdict = withTestT(subVerdicts.fingerprintsSubVerdict)
const categoryLabel = withTestT(subVerdicts.categoryLabel)

describe('codeAnalysisSubVerdict', () => {
  it('counts high+warning categories as the headline, tags top severities', () => {
    const result = codeAnalysisSubVerdict([
      { severity: 'high' },
      { severity: 'high' },
      { severity: 'warning' },
      { severity: 'info' },
      { severity: 'good' },
    ])
    expect(result.headline).toBe('3 Vulnerabilities')
    expect(result.tags).toEqual([
      { label: '2 High', kind: 'red' },
      { label: '1 Warning', kind: 'gold' },
    ])
  })

  it('shows "No Issues Found" when nothing is high or warning', () => {
    const result = codeAnalysisSubVerdict([{ severity: 'info' }, { severity: 'good' }])
    expect(result.headline).toBe('0 Vulnerabilities')
    expect(result.tags).toEqual([{ label: 'No Issues Found', kind: 'green' }])
  })
})

describe('behaviorAnalysisSubVerdict', () => {
  it('headlines the dangerous count, tags moderate and unclassified', () => {
    const result = behaviorAnalysisSubVerdict([
      { status: 'dangerous' },
      { status: 'dangerous' },
      { status: 'normal' },
      { status: 'unknown' },
    ])
    expect(result.headline).toBe('2 Dangerous')
    expect(result.tags).toEqual([
      { label: '1 Moderate', kind: 'gold' },
      { label: '1 Unclassified', kind: 'gray' },
    ])
  })
})

describe('appInformationSubVerdict', () => {
  it('headlines the critical (high-severity) count, tags moderate and low', () => {
    const result = appInformationSubVerdict([
      { severity: 'high' },
      { severity: 'warning' },
      { severity: 'info' },
      { severity: 'info' },
    ])
    expect(result.headline).toBe('1 Critical')
    expect(result.tags).toEqual([
      { label: '1 Moderate', kind: 'gold' },
      { label: '2 Low', kind: 'gray' },
    ])
  })
})

describe('threatIntelligenceSubVerdict', () => {
  it('sums yara and av counts into the headline', () => {
    const result = threatIntelligenceSubVerdict(3, 2, true)
    expect(result.headline).toBe('Flagged 5×')
    expect(result.tags).toEqual([
      { label: '3 YARA Matches', kind: 'red' },
      { label: '2 AV Detections', kind: 'red' },
    ])
  })

  it('shows "No Detections" when both are zero', () => {
    const result = threatIntelligenceSubVerdict(0, 0, true)
    expect(result.headline).toBe('No Detections')
    expect(result.tags).toEqual([
      { label: 'No YARA Matches', kind: 'green' },
      { label: 'Not Detected by AV', kind: 'green' },
    ])
  })
})

describe('networkSubVerdict', () => {
  it('reports no bad domains and no OFAC tag when clean', () => {
    const result = networkSubVerdict([{ bad: 'no', ofac: false }])
    expect(result.headline).toBe('No Bad Domains')
    expect(result.tags).toEqual([])
  })

  it('counts bad domains and adds an OFAC tag when present', () => {
    const result = networkSubVerdict([
      { bad: 'yes', ofac: true },
      { bad: 'no', ofac: true },
      { bad: 'no', ofac: false },
    ])
    expect(result.headline).toBe('1 Bad Domains')
    expect(result.tags).toEqual([{ label: '2 OFAC-Listed', kind: 'red' }])
  })
})

describe('fingerprintsSubVerdict', () => {
  it('counts distinct flagged category:value pairs, excluding compiler', () => {
    const result = fingerprintsSubVerdict([
      { matches: { obfuscator: ['Alipay'], compiler: ['r8'] } },
      { matches: { protector: ['MSA SDK'] } },
      { matches: { obfuscator: ['Alipay'] } },
    ])
    expect(result.headline).toBe('2 Identifiers Flagged')
    expect(result.tags).toEqual([
      { label: 'Obfuscator: Alipay', kind: 'gold' },
      { label: 'Protector: MSA SDK', kind: 'gold' },
    ])
  })

  it('handles files with no matches', () => {
    const result = fingerprintsSubVerdict([{ matches: null }])
    expect(result.headline).toBe('0 Identifiers Flagged')
    expect(result.tags).toEqual([])
  })

  it('caps tags to the first 2 distinct pairs while headline reflects total count', () => {
    const result = fingerprintsSubVerdict([
      { matches: { obfuscator: ['Alipay'] } },
      { matches: { protector: ['MSA SDK'] } },
      { matches: { anti_debug: ['Debuggy'] } },
      { matches: { manipulator: ['Smokey'] } },
    ])
    expect(result.headline).toBe('4 Identifiers Flagged')
    expect(result.tags).toHaveLength(2)
    expect(result.tags).toEqual([
      { label: 'Obfuscator: Alipay', kind: 'gold' },
      { label: 'Protector: MSA SDK', kind: 'gold' },
    ])
  })
})

describe('categoryLabel', () => {
  it('labels each known flagged category in English', () => {
    expect(categoryLabel('obfuscator')).toBe('Obfuscator')
    expect(categoryLabel('anti_debug')).toBe('Anti-Debug')
  })

  it('falls back to a capitalized raw value for an unrecognized category', () => {
    expect(categoryLabel('mystery_tool')).toBe('Mystery_tool')
  })
})

describe('Arabic locale', () => {
  it('translates headlines and tags across the sub-verdict functions', () => {
    i18n.global.locale.value = 'ar'
    expect(codeAnalysisSubVerdict([{ severity: 'high' }]).headline).toBe('1 ثغرات')
    expect(networkSubVerdict([{ bad: 'no' }]).headline).toBe('لا نطاقات ضارة')
    expect(categoryLabel('obfuscator')).toBe('أداة التمويه')
    i18n.global.locale.value = 'en'
  })
})

describe('sub-verdict helpers translate through the t argument', () => {
  const fakeT = ((key: string, named?: { count?: number }) =>
    named?.count === undefined
      ? `fake:${key}`
      : `fake:${key}:${named.count}`) as unknown as Translate

  it('codeAnalysisSubVerdict ignores shared locale state', () => {
    i18n.global.locale.value = 'ar'
    const result = subVerdicts.codeAnalysisSubVerdict([{ severity: 'high' }], fakeT)
    expect(result.headline).toBe('fake:subVerdicts.codeAnalysis.headline:1')
    i18n.global.locale.value = 'en'
  })

  it('networkSubVerdict ignores shared locale state', () => {
    i18n.global.locale.value = 'ar'
    const result = subVerdicts.networkSubVerdict([{ bad: 'no' }], fakeT)
    expect(result.headline).toBe('fake:subVerdicts.network.noBadDomains')
    i18n.global.locale.value = 'en'
  })

  it('categoryLabel ignores shared locale state', () => {
    i18n.global.locale.value = 'ar'
    expect(subVerdicts.categoryLabel('obfuscator', fakeT)).toBe(
      'fake:subVerdicts.categories.obfuscator',
    )
    i18n.global.locale.value = 'en'
  })
})
