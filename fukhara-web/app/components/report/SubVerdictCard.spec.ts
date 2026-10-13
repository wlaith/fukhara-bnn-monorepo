import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SubVerdictCard from './SubVerdictCard.vue'

describe('SubVerdictCard', () => {
  it('renders the category label and headline', () => {
    const wrapper = mount(SubVerdictCard, {
      props: {
        label: 'Code Analysis',
        subVerdict: { headline: '10 Vulnerabilities', headlineKind: 'red', tags: [] },
      },
    })
    expect(wrapper.text()).toContain('Code Analysis')
    expect(wrapper.text()).toContain('10 Vulnerabilities')
  })

  it('renders each tag', () => {
    const wrapper = mount(SubVerdictCard, {
      props: {
        label: 'Behavior Analysis',
        subVerdict: {
          headline: '1 Dangerous',
          headlineKind: 'red',
          tags: [
            { label: '16 Moderate', kind: 'gold' },
            { label: '20 Unclassified', kind: 'gray' },
          ],
        },
      },
    })
    expect(wrapper.text()).toContain('16 Moderate')
    expect(wrapper.text()).toContain('20 Unclassified')
  })

  it('renders nothing extra when there are no tags', () => {
    const wrapper = mount(SubVerdictCard, {
      props: { label: 'Network', subVerdict: { headline: 'No Bad Domains', headlineKind: 'green', tags: [] } },
    })
    expect(wrapper.findAll('.tag--compact')).toHaveLength(1)
  })
})
