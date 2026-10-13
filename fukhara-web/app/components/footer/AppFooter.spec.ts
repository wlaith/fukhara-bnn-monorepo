import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AppFooter from './AppFooter.vue'

describe('AppFooter', () => {
  it('renders the Fukhara logo and section headings in English', async () => {
    const wrapper = await mountSuspended(AppFooter, { route: '/' })
    expect(wrapper.find('img[alt="Fukhara"]').exists()).toBe(true)
    expect(wrapper.findAll('h2').map((h) => h.text())).toEqual(['Your data', 'Open source'])
  })

  it('links to the real JOSA site and GitHub repos in a new tab', async () => {
    const wrapper = await mountSuspended(AppFooter, { route: '/' })
    const external = wrapper.findAll('a[target="_blank"]').map((a) => a.attributes('href'))
    expect(external).toEqual([
      'https://josa.ngo',
      'https://github.com/jordanopensource/fukhara-web',
      'https://github.com/jordanopensource/fukhara-api',
    ])
  })

  it('renders Arabic copy and localized links on /ar', async () => {
    const wrapper = await mountSuspended(AppFooter, { route: '/ar' })
    expect(wrapper.text()).toContain('بياناتك')
    expect(wrapper.find('a[href="https://josa.ngo/ar"]').exists()).toBe(true)
  })
})
