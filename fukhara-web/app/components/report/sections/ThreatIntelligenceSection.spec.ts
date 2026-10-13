import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ThreatIntelligenceSection from './ThreatIntelligenceSection.vue'
import { REPORT_INJECTION_KEY } from '../../../composables/useReport'
import i18n from '~/test-utils/i18n'

describe('ThreatIntelligenceSection', () => {
  it('calls load() on mount and renders YARA match rows once data is present', async () => {
    const load = vi.fn()
    const report = {
      threatIntelligence: {
        data: ref({
          yara_matches: {
            matches: [{ source: 'classes.dex', rules: ['Android_Dynamic_Code_Loading', 'Android_Root_Detection_Bypass'] }],
          },
        }),
        loading: ref(false),
        error: ref(null),
        load,
      },
    }
    const wrapper = mount(ThreatIntelligenceSection, {
      global: { provide: { [REPORT_INJECTION_KEY as symbol]: report } },
    })
    expect(load).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('Android_Dynamic_Code_Loading')
    expect(wrapper.text()).toContain('Android_Root_Detection_Bypass')
    expect(wrapper.text()).toContain('classes.dex')
  })

  it('shows the Arabic title when the locale is ar', () => {
    i18n.global.locale.value = 'ar'
    const report = {
      threatIntelligence: {
        data: ref({ yara_matches: { matches: [] } }),
        loading: ref(false),
        error: ref(null),
        load: vi.fn(),
      },
    }
    const wrapper = mount(ThreatIntelligenceSection, {
      global: { provide: { [REPORT_INJECTION_KEY as symbol]: report } },
    })
    expect(wrapper.text()).toContain('تطابقات YARA')
    i18n.global.locale.value = 'en'
  })
})
