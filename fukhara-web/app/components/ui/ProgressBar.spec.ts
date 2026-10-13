import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProgressBar from './ProgressBar.vue'

describe('ProgressBar', () => {
  it('renders the label and helper text', () => {
    const wrapper = mount(ProgressBar, {
      props: { percent: 50, label: 'Running static analysis', helperText: 'Almost there' },
    })
    expect(wrapper.text()).toContain('Running static analysis')
    expect(wrapper.text()).toContain('Almost there')
  })

  it('sets the fill width from percent', () => {
    const wrapper = mount(ProgressBar, {
      props: { percent: 75, label: 'Step', helperText: 'Help' },
    })
    const fill = wrapper.get('.progress-bar__fill')
    expect(fill.attributes('style')).toContain('width: 75%')
  })

  it('clamps percent to the 0-100 range', () => {
    const wrapper = mount(ProgressBar, {
      props: { percent: 150, label: 'Step', helperText: 'Help' },
    })
    expect(wrapper.get('.progress-bar__fill').attributes('style')).toContain('width: 100%')
  })
})
