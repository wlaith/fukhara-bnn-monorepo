import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import CodeAnalysisSection from './CodeAnalysisSection.vue'
import { REPORT_INJECTION_KEY } from '../../../composables/useReport'
import i18n from '~/test-utils/i18n'

describe('CodeAnalysisSection', () => {
  function makeReport() {
    return {
      codeAnalysis: {
        data: ref({
          code_vulnerabilities: {
            android_logging: {
              files: { 'LogActivity.java': '24' },
              metadata: { cvss: 7.5, cwe: 'CWE-532: Insertion of Sensitive Info into Log File', severity: 'high', description: 'd' },
            },
            android_ssl_pinning: {
              files: { 'NetActivity.java': '10' },
              metadata: { cvss: 0, cwe: 'CWE-999: Fine', severity: 'good', description: 'd2' },
            },
          },
        }),
        loading: ref(false),
        error: ref(null),
        load: vi.fn(),
      },
    }
  }

  it('calls load() on mount and defaults to showing all vulnerabilities', () => {
    const report = makeReport()
    const wrapper = mount(CodeAnalysisSection, {
      global: { provide: { [REPORT_INJECTION_KEY as symbol]: report } },
    })
    expect(report.codeAnalysis.load).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('CWE-532')
    expect(wrapper.text()).toContain('CWE-999')
    expect(wrapper.text()).toContain('Code Vulnerability · 2')
  })

  it('switching the severity tab shows only the matching vulnerabilities', async () => {
    const report = makeReport()
    const wrapper = mount(CodeAnalysisSection, {
      global: { provide: { [REPORT_INJECTION_KEY as symbol]: report } },
    })
    const goodTab = wrapper.findAll('.tabs__item').find((el) => el.text() === 'Good')
    await goodTab?.trigger('click')
    expect(wrapper.text()).toContain('CWE-999')
    expect(wrapper.text()).not.toContain('CWE-532')
  })

  it('shows Arabic tab labels and list title when the locale is ar', () => {
    i18n.global.locale.value = 'ar'
    const report = makeReport()
    const wrapper = mount(CodeAnalysisSection, {
      global: { provide: { [REPORT_INJECTION_KEY as symbol]: report } },
    })
    expect(wrapper.text()).toContain('عالية')
    expect(wrapper.text()).toContain('ثغرات الشيفرة · 2')
    i18n.global.locale.value = 'en'
  })
})
