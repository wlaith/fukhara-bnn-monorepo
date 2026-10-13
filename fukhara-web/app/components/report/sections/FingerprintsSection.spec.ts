import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import FingerprintsSection from './FingerprintsSection.vue'
import { REPORT_INJECTION_KEY } from '../../../composables/useReport'
import i18n from '~/test-utils/i18n'

describe('FingerprintsSection', () => {
  it('calls load() on mount and renders checksums, identifiers, and fuzzy hashes', () => {
    const load = vi.fn()
    const report = {
      fingerprints: {
        data: ref({
          checksums: { md5: 'aaa111', sha1: 'bbb222', sha256: 'ccc333', size: '10MB' },
          identifiers: {
            apkid: {
              apkid_version: '3.1.0',
              files: {
                files: [
                  { filename: 'classes.dex', matches: { obfuscator: ['Alipay'], compiler: ['r8'] } },
                ],
              },
            },
          },
          fuzzy_hashes: { ssdeep: [{ filename: 'classes.dex', fuzzy_hash: 'abc:def' }] },
        }),
        loading: ref(false),
        error: ref(null),
        load,
      },
    }
    const wrapper = mount(FingerprintsSection, {
      global: { provide: { [REPORT_INJECTION_KEY as symbol]: report } },
    })
    expect(load).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('aaa111')
    expect(wrapper.text()).toContain('Obfuscator: Alipay')
    expect(wrapper.text()).not.toContain('r8')
    expect(wrapper.text()).toContain('classes.dex')
    expect(wrapper.text()).toContain('abc:def')
  })

  it('renders an inline error message when error.value is set', () => {
    const report = {
      fingerprints: {
        data: ref(null),
        loading: ref(false),
        error: ref('Failed to load fingerprints'),
        load: vi.fn(),
      },
    }
    const wrapper = mount(FingerprintsSection, {
      global: { provide: { [REPORT_INJECTION_KEY as symbol]: report } },
    })
    expect(wrapper.find('.section-error').text()).toBe('Failed to load fingerprints')
  })

  it('shows Arabic titles and the translated category label when the locale is ar', () => {
    i18n.global.locale.value = 'ar'
    const report = {
      fingerprints: {
        data: ref({
          checksums: { md5: 'aaa111', sha1: 'bbb222', sha256: 'ccc333', size: '10MB' },
          identifiers: {
            apkid: { files: { files: [{ filename: 'classes.dex', matches: { obfuscator: ['Alipay'] } }] } },
          },
          fuzzy_hashes: { ssdeep: [{ filename: 'classes.dex', fuzzy_hash: 'abc:def' }] },
        }),
        loading: ref(false),
        error: ref(null),
        load: vi.fn(),
      },
    }
    const wrapper = mount(FingerprintsSection, {
      global: { provide: { [REPORT_INJECTION_KEY as symbol]: report } },
    })
    expect(wrapper.text()).toContain('البصمات')
    expect(wrapper.text()).toContain('المعرّفات')
    expect(wrapper.text()).toContain('أداة التمويه: Alipay')
    i18n.global.locale.value = 'en'
  })
})
