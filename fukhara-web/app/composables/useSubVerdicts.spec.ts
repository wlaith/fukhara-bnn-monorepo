import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useSubVerdicts } from './useSubVerdicts'
import type { ReportContext } from './useReport'
import i18n from '~/test-utils/i18n'

function sectionWith(data: unknown) {
  return { data: ref(data), loading: ref(false), error: ref(null), load: async () => {} }
}

describe('useSubVerdicts', () => {
  it('returns null for a section before its data has loaded', () => {
    const report = {
      codeAnalysis: sectionWith(null),
      behaviorAnalysis: sectionWith(null),
      appAnalysis: sectionWith(null),
      threatIntelligence: sectionWith(null),
      networkAnalysis: sectionWith(null),
      fingerprints: sectionWith(null),
    } as unknown as ReportContext
    const subVerdicts = useSubVerdicts(report, i18n.global.t)
    expect(subVerdicts.codeAnalysis.value).toBeNull()
  })

  it('computes the code analysis sub-verdict once data loads', () => {
    const report = {
      codeAnalysis: sectionWith({
        code_vulnerabilities: {
          a: { metadata: { severity: 'high' } },
          b: { metadata: { severity: 'good' } },
        },
      }),
      behaviorAnalysis: sectionWith(null),
      appAnalysis: sectionWith(null),
      threatIntelligence: sectionWith(null),
      networkAnalysis: sectionWith(null),
      fingerprints: sectionWith(null),
    } as unknown as ReportContext
    const subVerdicts = useSubVerdicts(report, i18n.global.t)
    expect(subVerdicts.codeAnalysis.value?.headline).toBe('1 Vulnerabilities')
  })

  it('computes the network sub-verdict once data loads', () => {
    const report = {
      codeAnalysis: sectionWith(null),
      behaviorAnalysis: sectionWith(null),
      appAnalysis: sectionWith(null),
      threatIntelligence: sectionWith(null),
      networkAnalysis: sectionWith({
        domains: {
          'evil.example': { bad: 'yes', ofac: false },
          'good.example': { bad: 'no', ofac: false },
        },
      }),
      fingerprints: sectionWith(null),
    } as unknown as ReportContext
    const subVerdicts = useSubVerdicts(report, i18n.global.t)
    expect(subVerdicts.network.value?.headline).toBe('1 Bad Domains')
  })

  it('computes the fingerprints sub-verdict from the real nested identifiers.apkid.files.files shape', () => {
    const report = {
      codeAnalysis: sectionWith(null),
      behaviorAnalysis: sectionWith(null),
      appAnalysis: sectionWith(null),
      threatIntelligence: sectionWith(null),
      networkAnalysis: sectionWith(null),
      fingerprints: sectionWith({
        identifiers: {
          apkid: {
            files: {
              apkid_version: '3.6.6',
              files: [
                {
                  filename: 'sample.apk',
                  matches: { manipulator: ['Resources Confusion'] },
                },
                {
                  filename: 'sample.apk!classes.dex',
                  matches: { obfuscator: ['Alipay'], compiler: ['r8'] },
                },
                {
                  filename: 'sample.apk!classes2.dex',
                  matches: { protector: ['MSA SDK'] },
                },
              ],
            },
          },
        },
      }),
    } as unknown as ReportContext
    const subVerdicts = useSubVerdicts(report, i18n.global.t)
    expect(subVerdicts.fingerprints.value?.headline).toBe('3 Identifiers Flagged')
    expect(subVerdicts.fingerprints.value?.tags).toContainEqual({
      label: 'Manipulator: Resources Confusion',
      kind: 'gold',
    })
  })
})
