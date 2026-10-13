import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import SubVerdictGrid from './SubVerdictGrid.vue'
import type { ReportContext } from '../../composables/useReport'
import i18n from '~/test-utils/i18n'

function sectionWith(data: unknown) {
  return { data: ref(data), loading: ref(false), error: ref(null), load: async () => {} }
}

describe('SubVerdictGrid', () => {
  it('renders a card once its section has data, and nothing for sections still loading', () => {
    const report = {
      codeAnalysis: sectionWith({ code_vulnerabilities: { a: { metadata: { severity: 'high' } } } }),
      behaviorAnalysis: sectionWith(null),
      appAnalysis: sectionWith(null),
      threatIntelligence: sectionWith(null),
      networkAnalysis: sectionWith(null),
      fingerprints: sectionWith(null),
    } as unknown as ReportContext
    const wrapper = mount(SubVerdictGrid, { props: { report } })
    expect(wrapper.text()).toContain('Code Analysis')
    expect(wrapper.text()).toContain('1 Vulnerabilities')
    expect(wrapper.text()).not.toContain('Behavior Analysis')
  })

  it('renders the Arabic card label and headline when the locale is ar', () => {
    i18n.global.locale.value = 'ar'
    const report = {
      codeAnalysis: sectionWith({ code_vulnerabilities: { a: { metadata: { severity: 'high' } } } }),
      behaviorAnalysis: sectionWith(null),
      appAnalysis: sectionWith(null),
      threatIntelligence: sectionWith(null),
      networkAnalysis: sectionWith(null),
      fingerprints: sectionWith(null),
    } as unknown as ReportContext
    const wrapper = mount(SubVerdictGrid, { props: { report } })
    expect(wrapper.text()).toContain('تحليل الشيفرة')
    expect(wrapper.text()).toContain('1 ثغرات')
    i18n.global.locale.value = 'en'
  })
})
