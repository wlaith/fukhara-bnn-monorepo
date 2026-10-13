import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import NetworkSection from './NetworkSection.vue'
import { REPORT_INJECTION_KEY } from '../../../composables/useReport'
import i18n from '~/test-utils/i18n'

describe('NetworkSection', () => {
  it('calls load() on mount and renders domain rows once data is present', async () => {
    const load = vi.fn()
    const report = {
      networkAnalysis: {
        data: ref({
          domains: {
            'evil.example.com': { bad: 'yes', geolocation: null, ofac: false },
          },
        }),
        loading: ref(false),
        error: ref(null),
        load,
      },
    }
    const wrapper = mount(NetworkSection, {
      global: { provide: { [REPORT_INJECTION_KEY as symbol]: report } },
    })
    expect(load).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('evil.example.com')
    expect(wrapper.text()).toContain('Malicious')
  })

  it('shows Arabic title and label when the locale is ar', () => {
    i18n.global.locale.value = 'ar'
    const report = {
      networkAnalysis: {
        data: ref({ domains: { 'evil.example.com': { bad: 'yes', geolocation: null, ofac: false } } }),
        loading: ref(false),
        error: ref(null),
        load: vi.fn(),
      },
    }
    const wrapper = mount(NetworkSection, {
      global: { provide: { [REPORT_INJECTION_KEY as symbol]: report } },
    })
    expect(wrapper.text()).toContain('النطاقات')
    expect(wrapper.text()).toContain('ضار')
    i18n.global.locale.value = 'en'
  })
})
