import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import type { DOMWrapper } from '@vue/test-utils'
import { useRouter } from '#imports'
import AppHeader from './AppHeader.vue'

function findButton(wrapper: Awaited<ReturnType<typeof mountSuspended>>, label: string) {
  return wrapper.findAll('button').find((b: DOMWrapper<Element>) => b.text() === label)
}

describe('AppHeader', () => {
  it('renders the Fukhara logo and nav links', async () => {
    const wrapper = await mountSuspended(AppHeader, { route: '/' })
    expect(wrapper.find('img[alt="Fukhara"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('About')
    expect(wrapper.text()).not.toContain('Documentation')
    expect(wrapper.text()).not.toContain('Analyze')
  })

  it('emits analyze when the Analyze button is clicked', async () => {
    const wrapper = await mountSuspended(AppHeader, { route: '/about' })
    await wrapper.find('.button--primary').trigger('click')
    expect(wrapper.emitted('analyze')).toHaveLength(1)
  })

  it('shows Arabic nav labels and the English switcher on /ar/about', async () => {
    const wrapper = await mountSuspended(AppHeader, { route: '/ar/about' })
    expect(wrapper.text()).toContain('حول')
    expect(wrapper.text()).toContain('تحليل')
    expect(wrapper.text()).toContain('English')
  })

  it('shows the Arabic switcher label on the English route', async () => {
    const wrapper = await mountSuspended(AppHeader, { route: '/' })
    expect(wrapper.text()).toContain('العربية')
  })

  it('clicking the switcher on the English route navigates to /ar', async () => {
    const wrapper = await mountSuspended(AppHeader, { route: '/' })
    await findButton(wrapper, 'العربية')?.trigger('click')
    await vi.waitFor(() => expect(useRouter().currentRoute.value.fullPath).toBe('/ar'))
  })

  it('clicking the switcher on /ar navigates back to the unprefixed route', async () => {
    const wrapper = await mountSuspended(AppHeader, { route: '/ar' })
    await findButton(wrapper, 'English')?.trigger('click')
    await vi.waitFor(() => expect(useRouter().currentRoute.value.fullPath).toBe('/'))
  })

  it('keeps the id and section when switching locale mid-report, in both directions', async () => {
    const arabic = await mountSuspended(AppHeader, { route: '/ar/report/abc123/network' })
    await findButton(arabic, 'English')?.trigger('click')
    await vi.waitFor(() =>
      expect(useRouter().currentRoute.value.fullPath).toBe('/report/abc123/network'),
    )

    const english = await mountSuspended(AppHeader, { route: '/report/abc123/network' })
    await findButton(english, 'العربية')?.trigger('click')
    await vi.waitFor(() =>
      expect(useRouter().currentRoute.value.fullPath).toBe('/ar/report/abc123/network'),
    )
  })
})
