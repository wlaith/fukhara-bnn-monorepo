import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ContainedList from './ContainedList.vue'
import i18n from '~/test-utils/i18n'

const rows = [
  {
    id: '1',
    title: 'CWE-532 · Insertion of Sensitive Info into Log File',
    meta: 'LogActivity.java:24 · Warning · CVSS 7.5',
  },
  {
    id: '2',
    title: 'CWE-296 · Improper Certificate Chain Validation',
    meta: 'NetworkSecurityActivity.java:58 · Warning · CVSS 5.9',
  },
]

describe('ContainedList', () => {
  it('renders the title verbatim, without inventing a count suffix', () => {
    const wrapper = mount(ContainedList, { props: { title: 'Code Vulnerability · 3 of 10', rows } })
    expect(wrapper.get('.contained-list__header').text()).toBe('Code Vulnerability · 3 of 10')
  })

  it('renders every row title and meta', () => {
    const wrapper = mount(ContainedList, { props: { title: 'Code Vulnerability', rows } })
    for (const row of rows) {
      expect(wrapper.text()).toContain(row.title)
      expect(wrapper.text()).toContain(row.meta)
    }
  })

  it('shows an empty message when there are no rows', () => {
    const wrapper = mount(ContainedList, {
      props: { title: 'Code Vulnerability · 0 of 0', rows: [] },
    })
    expect(wrapper.text()).toContain('No findings')
  })

  it('shows the Arabic empty message when the locale is ar', () => {
    i18n.global.locale.value = 'ar'
    const wrapper = mount(ContainedList, {
      props: { title: 'Code Vulnerability · 0 of 0', rows: [] },
    })
    expect(wrapper.text()).toContain('لا نتائج')
    i18n.global.locale.value = 'en'
  })
})
