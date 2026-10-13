import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Tag from './Tag.vue'

describe('Tag', () => {
  it('renders its slot content', () => {
    const wrapper = mount(Tag, { props: { kind: 'red' }, slots: { default: 'High Severity' } })
    expect(wrapper.text()).toBe('High Severity')
  })

  it('applies a class per kind', () => {
    const wrapper = mount(Tag, { props: { kind: 'gold' }, slots: { default: '16 Moderate' } })
    expect(wrapper.classes()).toContain('tag--gold')
  })

  it('defaults to the operational size', () => {
    const wrapper = mount(Tag, { props: { kind: 'green' }, slots: { default: 'No Bad Domains' } })
    expect(wrapper.classes()).toContain('tag--operational')
  })

  it('applies the compact size when passed', () => {
    const wrapper = mount(Tag, {
      props: { kind: 'gray', size: 'compact' },
      slots: { default: 'No YARA Matches' },
    })
    expect(wrapper.classes()).toContain('tag--compact')
  })
})
