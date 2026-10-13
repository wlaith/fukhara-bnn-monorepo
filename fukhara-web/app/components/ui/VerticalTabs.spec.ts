import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VerticalTabs from './VerticalTabs.vue'

const items = [
  { id: 'code-analysis', label: 'Code Analysis' },
  { id: 'behavior-analysis', label: 'Behavior Analysis' },
  { id: 'fingerprints', label: 'Fingerprints' },
]

describe('VerticalTabs', () => {
  it('renders every item label', () => {
    const wrapper = mount(VerticalTabs, { props: { items, activeId: 'code-analysis' } })
    for (const item of items) expect(wrapper.text()).toContain(item.label)
  })

  it('marks the active item', () => {
    const wrapper = mount(VerticalTabs, { props: { items, activeId: 'behavior-analysis' } })
    const active = wrapper
      .findAll('.vertical-tabs__item')
      .find((el) => el.classes().includes('vertical-tabs__item--active'))
    expect(active?.text()).toBe('Behavior Analysis')
  })

  it('emits select with the clicked item id', async () => {
    const wrapper = mount(VerticalTabs, { props: { items, activeId: 'code-analysis' } })
    const rows = wrapper.findAll('.vertical-tabs__item')
    await rows[2]!.trigger('click')
    expect(wrapper.emitted('select')?.[0]).toEqual(['fingerprints'])
  })
})
