import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { clearNuxtData, useRouter } from '#imports'

const getVerdict = vi.fn()
const getFingerprints = vi.fn()
const getThreatIntelligence = vi.fn()
const getAppAnalysis = vi.fn()
const getCodeAnalysis = vi.fn()
const getBehaviorAnalysis = vi.fn()
const getNetworkAnalysis = vi.fn()

vi.mock('~/api/reportApi', () => ({
  getVerdict: (...args: unknown[]) => getVerdict(...args),
  getFingerprints: (...args: unknown[]) => getFingerprints(...args),
  getThreatIntelligence: (...args: unknown[]) => getThreatIntelligence(...args),
  getAppAnalysis: (...args: unknown[]) => getAppAnalysis(...args),
  getCodeAnalysis: (...args: unknown[]) => getCodeAnalysis(...args),
  getBehaviorAnalysis: (...args: unknown[]) => getBehaviorAnalysis(...args),
  getNetworkAnalysis: (...args: unknown[]) => getNetworkAnalysis(...args),
}))

import ReportPage from './[[section]].vue'
import ControlFlowSection from '~/components/report/sections/ControlFlowSection.vue'
import BehaviorAnalysisSection from '~/components/report/sections/BehaviorAnalysisSection.vue'
import AppInformationSection from '~/components/report/sections/AppInformationSection.vue'
import ThreatIntelligenceSection from '~/components/report/sections/ThreatIntelligenceSection.vue'
import NetworkSection from '~/components/report/sections/NetworkSection.vue'
import FingerprintsSection from '~/components/report/sections/FingerprintsSection.vue'
import CodeAnalysisSection from '~/components/report/sections/CodeAnalysisSection.vue'

async function mountReport(route = '/report/abc123') {
  const wrapper = await mountSuspended(ReportPage, { route })
  await flushPromises()
  return wrapper
}

describe('report page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearNuxtData()
    getVerdict.mockResolvedValue({ verdict: 'Malicious', severity: 'High', reason: 'r', response: 'r2' })
    getFingerprints.mockResolvedValue({})
    getThreatIntelligence.mockResolvedValue({})
    getAppAnalysis.mockResolvedValue({})
    getCodeAnalysis.mockResolvedValue({})
    getBehaviorAnalysis.mockResolvedValue({})
    getNetworkAnalysis.mockResolvedValue({})
  })

  it('fetches and renders the verdict banner', async () => {
    const wrapper = await mountReport()
    expect(wrapper.text()).toContain('Malicious')
  })

  it('defaults to the code-analysis section and shows all 7 vertical tabs', async () => {
    const wrapper = await mountReport()
    for (const label of [
      'Code Analysis',
      'Behavior Analysis',
      'App Information',
      'Threat Intelligence',
      'Network',
      'Fingerprints',
      'Control Flow',
    ]) {
      expect(wrapper.text()).toContain(label)
    }
  })

  it('loads all 6 data sections up front, not just the active tab (SubVerdictGrid needs all 6)', async () => {
    await mountReport()
    expect(getFingerprints).toHaveBeenCalledTimes(1)
    expect(getThreatIntelligence).toHaveBeenCalledTimes(1)
    expect(getAppAnalysis).toHaveBeenCalledTimes(1)
    expect(getCodeAnalysis).toHaveBeenCalledTimes(1)
    expect(getBehaviorAnalysis).toHaveBeenCalledTimes(1)
    expect(getNetworkAnalysis).toHaveBeenCalledTimes(1)
  })

  it('renders the Control Flow section and updates the route when its tab is selected', async () => {
    const wrapper = await mountReport()
    const controlFlowTab = wrapper
      .findAll('.vertical-tabs__item')
      .find((el) => el.text() === 'Control Flow')
    await controlFlowTab?.trigger('click')
    await vi.waitFor(() =>
      expect(useRouter().currentRoute.value.params.section).toBe('control-flow'),
    )
    await flushPromises()
    expect(wrapper.text()).toContain('Not yet available')
  })

  it('renders the tabs and no section panel for an unknown section id', async () => {
    const wrapper = await mountReport('/report/abc123/not-a-section')
    expect(wrapper.text()).toContain('Code Analysis')
    expect(wrapper.text()).not.toContain('Not yet available')
    expect(wrapper.find('.section-error').exists()).toBe(false)
    for (const section of [
      ControlFlowSection,
      BehaviorAnalysisSection,
      AppInformationSection,
      ThreatIntelligenceSection,
      NetworkSection,
      FingerprintsSection,
      CodeAnalysisSection,
    ]) {
      expect(wrapper.findComponent(section).exists()).toBe(false)
    }
  })

  it('shows Arabic tab labels on /ar', async () => {
    const wrapper = await mountReport('/ar/report/abc123')
    for (const label of ['تحليل الشيفرة', 'تحليل السلوك', 'معلومات التطبيق', 'الشبكة', 'البصمات']) {
      expect(wrapper.text()).toContain(label)
    }
  })
})
