import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import BehaviorAnalysisSection from './BehaviorAnalysisSection.vue'
import { REPORT_INJECTION_KEY } from '../../../composables/useReport'
import i18n from '~/test-utils/i18n'

describe('BehaviorAnalysisSection', () => {
  it('calls load() on mount and renders permission rows once data is present', async () => {
    const load = vi.fn()
    const report = {
      behaviorAnalysis: {
        data: ref({
          permissions: {
            'android.permission.CAMERA': { status: 'dangerous', info: 'take pictures', description: '' },
          },
        }),
        loading: ref(false),
        error: ref(null),
        load,
      },
    }
    const wrapper = mount(BehaviorAnalysisSection, {
      global: { provide: { [REPORT_INJECTION_KEY as symbol]: report } },
    })
    expect(load).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('android.permission.CAMERA')
    expect(wrapper.text()).toContain('Take pictures')
    // permissionStatusLabel() translates the raw status word rather than passing it through.
    expect(wrapper.text()).toContain('Dangerous')
  })

  it('renders an inline error message when error.value is set', () => {
    const report = {
      behaviorAnalysis: {
        data: ref(null),
        loading: ref(false),
        error: ref('Failed to load behavior analysis'),
        load: vi.fn(),
      },
    }
    const wrapper = mount(BehaviorAnalysisSection, {
      global: { provide: { [REPORT_INJECTION_KEY as symbol]: report } },
    })
    expect(wrapper.find('.section-error').text()).toBe('Failed to load behavior analysis')
  })

  it('shows the Arabic title and status label when the locale is ar', () => {
    i18n.global.locale.value = 'ar'
    const report = {
      behaviorAnalysis: {
        data: ref({
          permissions: {
            'android.permission.CAMERA': { status: 'dangerous', info: 'take pictures', description: '' },
          },
        }),
        loading: ref(false),
        error: ref(null),
        load: vi.fn(),
      },
    }
    const wrapper = mount(BehaviorAnalysisSection, {
      global: { provide: { [REPORT_INJECTION_KEY as symbol]: report } },
    })
    expect(wrapper.text()).toContain('الأذونات')
    expect(wrapper.text()).toContain('خطير')
    i18n.global.locale.value = 'en'
  })
})
