import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Tabs from './Tabs.vue'

const items = [
  { id: 'high', label: 'High' },
  { id: 'warning', label: 'Warning' },
  { id: 'info', label: 'Info' },
  { id: 'good', label: 'Good' },
]

describe('Tabs', () => {
  it('renders every item label', () => {
    const wrapper = mount(Tabs, { props: { items, activeId: 'high' } })
    for (const item of items) expect(wrapper.text()).toContain(item.label)
  })

  it('marks the active item', () => {
    const wrapper = mount(Tabs, { props: { items, activeId: 'warning' } })
    const active = wrapper
      .findAll('.tabs__item')
      .find((el) => el.classes().includes('tabs__item--active'))
    expect(active?.text()).toBe('Warning')
  })

  it('emits select with the clicked item id', async () => {
    const wrapper = mount(Tabs, { props: { items, activeId: 'high' } })
    const rows = wrapper.findAll('.tabs__item')
    await rows[3]!.trigger('click')
    expect(wrapper.emitted('select')?.[0]).toEqual(['good'])
  })
})
