import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EmptyState from './EmptyState.vue'

describe('EmptyState', () => {
  it('renders the title and description', () => {
    const wrapper = mount(EmptyState, {
      props: { title: 'Not yet available', description: 'This section is still being built.' },
    })
    expect(wrapper.text()).toContain('Not yet available')
    expect(wrapper.text()).toContain('This section is still being built.')
  })
})
