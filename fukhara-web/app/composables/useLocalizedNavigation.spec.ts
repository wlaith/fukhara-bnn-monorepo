import { describe, it, expect } from 'vitest'
import { defineComponent, h } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { useRouter } from '#imports'
import { useLocalizedNavigation } from './useLocalizedNavigation'

type Nav = ReturnType<typeof useLocalizedNavigation>

const Probe = defineComponent({
  setup(_, { expose }) {
    expose(useLocalizedNavigation())
    return () => h('div')
  },
})

describe('useLocalizedNavigation', () => {
  it('pushes the unprefixed path when the current locale is English', async () => {
    const wrapper = await mountSuspended(Probe, { route: '/' })
    await (wrapper.vm as unknown as Nav).push({
      name: 'report',
      params: { id: 'abc123', section: 'network' },
    })
    expect(useRouter().currentRoute.value.fullPath).toBe('/report/abc123/network')
  })

  it('keeps the /ar prefix when the current locale is Arabic', async () => {
    const wrapper = await mountSuspended(Probe, { route: '/ar' })
    await (wrapper.vm as unknown as Nav).push({ name: 'analyzing', params: { id: 'abc123' } })
    expect(useRouter().currentRoute.value.fullPath).toBe('/ar/analyzing/abc123')
  })

  it('replace() resolves the same localized path', async () => {
    const wrapper = await mountSuspended(Probe, { route: '/ar' })
    await (wrapper.vm as unknown as Nav).replace({ name: 'home' })
    expect(useRouter().currentRoute.value.fullPath).toBe('/ar')
  })
})
