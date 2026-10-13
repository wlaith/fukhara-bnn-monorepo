import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ControlFlowSection from './ControlFlowSection.vue'
import i18n from '~/test-utils/i18n'

describe('ControlFlowSection', () => {
  it('renders the not-yet-available empty state', () => {
    const wrapper = mount(ControlFlowSection)
    expect(wrapper.text()).toContain('Not yet available')
  })

  it('renders the Arabic empty state when the locale is ar', () => {
    i18n.global.locale.value = 'ar'
    const wrapper = mount(ControlFlowSection)
    expect(wrapper.text()).toContain('غير متاح بعد')
    i18n.global.locale.value = 'en'
  })
})
