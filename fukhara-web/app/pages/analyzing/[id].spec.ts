import { describe, it, expect, vi, afterEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { useRouter } from '#imports'
import AnalyzingPage from './[id].vue'

describe('analyzing page', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('renders the progress heading', async () => {
    const wrapper = await mountSuspended(AnalyzingPage, { route: '/analyzing/abc123' })
    expect(wrapper.text()).toContain('We are analyzing your file')
  })

  it('renders the Arabic progress heading on /ar', async () => {
    const wrapper = await mountSuspended(AnalyzingPage, { route: '/ar/analyzing/abc123' })
    expect(wrapper.text()).toContain('نقوم بتحليل ملفك')
  })

  it('navigates to the report when the steps finish', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
    const wrapper = await mountSuspended(AnalyzingPage, { route: '/analyzing/abc123' })
    vi.advanceTimersByTime(8000)
    await vi.waitFor(() => expect(useRouter().currentRoute.value.fullPath).toBe('/report/abc123'))
    wrapper.unmount()
  })

  it('stops the progress timer when the page is left before it finishes', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
    const wrapper = await mountSuspended(AnalyzingPage, { route: '/analyzing/abc123' })
    const router = useRouter()
    const push = vi.spyOn(router, 'push')
    const replace = vi.spyOn(router, 'replace')
    wrapper.unmount()
    vi.advanceTimersByTime(20000)
    await flushPromises()
    expect(push).not.toHaveBeenCalled()
    expect(replace).not.toHaveBeenCalled()
    expect(useRouter().currentRoute.value.fullPath).toBe('/analyzing/abc123')
  })
})
