import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import App from './app.vue'

describe('app shell', () => {
  it('renders the app header', async () => {
    const wrapper = await mountSuspended(App, { route: '/' })
    expect(wrapper.find('img[alt="Fukhara"]').exists()).toBe(true)
  })

  it('shows the English switcher on /ar', async () => {
    const wrapper = await mountSuspended(App, { route: '/ar' })
    expect(wrapper.text()).toContain('English')
  })
})
