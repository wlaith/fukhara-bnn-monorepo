import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from './Button.vue'

describe('Button', () => {
  it('renders its slot content', () => {
    const wrapper = mount(Button, { slots: { default: 'Analyze' } })
    expect(wrapper.text()).toBe('Analyze')
  })

  it('defaults to the secondary variant', () => {
    const wrapper = mount(Button, { slots: { default: 'About' } })
    expect(wrapper.classes()).toContain('button--secondary')
  })

  it('applies the primary variant class when passed', () => {
    const wrapper = mount(Button, { props: { variant: 'primary' }, slots: { default: 'Analyze' } })
    expect(wrapper.classes()).toContain('button--primary')
  })

  it('emits click when clicked', async () => {
    const wrapper = mount(Button, { slots: { default: 'Analyze' } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })
})
