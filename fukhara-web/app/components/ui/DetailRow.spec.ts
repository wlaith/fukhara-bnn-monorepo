import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DetailRow from './DetailRow.vue'

describe('DetailRow', () => {
  it('renders the label, icon alt text, and slot content', () => {
    const wrapper = mount(DetailRow, {
      props: { iconSrc: '/icons/shield.svg', iconAlt: 'shield', label: 'Certificate' },
      slots: { default: 'Issuer: Example CA' },
    })
    expect(wrapper.text()).toContain('Certificate')
    expect(wrapper.text()).toContain('Issuer: Example CA')
    expect(wrapper.get('img').attributes('alt')).toBe('shield')
  })
})
