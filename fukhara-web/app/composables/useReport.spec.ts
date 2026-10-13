import { describe, it, expect, vi, beforeEach } from 'vitest'
import { clearNuxtData } from '#imports'

vi.mock('../api/reportApi', () => ({
  getVerdict: vi.fn().mockResolvedValue({ verdict: 'Malicious' }),
  getFingerprints: vi
    .fn()
    .mockResolvedValue({ checksums: null, identifiers: null, fuzzy_hashes: null }),
  getThreatIntelligence: vi.fn().mockResolvedValue({}),
  getAppAnalysis: vi.fn().mockResolvedValue({}),
  getCodeAnalysis: vi.fn().mockResolvedValue({}),
  getBehaviorAnalysis: vi.fn().mockResolvedValue({}),
  getNetworkAnalysis: vi.fn().mockResolvedValue({}),
}))

import { getVerdict } from '../api/reportApi'
import { useReport } from './useReport'

describe('useReport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearNuxtData()
  })

  it('starts each section with no data and no error', () => {
    const report = useReport('sample-id-1')
    expect(report.verdict.data.value).toBeNull()
    expect(report.verdict.error.value).toBeNull()
  })

  it('populates data and clears loading once the fetch resolves', async () => {
    const report = useReport('sample-id-2')
    await vi.waitFor(() => expect(report.verdict.loading.value).toBe(false))
    expect(report.verdict.data.value).toEqual({ verdict: 'Malicious' })
  })

  it('calls the API once even when load() is called afterwards', async () => {
    const report = useReport('sample-id-3')
    await report.verdict.load()
    await vi.waitFor(() => expect(report.verdict.loading.value).toBe(false))
    await report.verdict.load()
    expect(getVerdict).toHaveBeenCalledTimes(1)
  })

  it('exposes the error message and clears loading when the fetch rejects', async () => {
    vi.mocked(getVerdict).mockRejectedValueOnce(new Error('network down'))
    const report = useReport('sample-id-4')
    await vi.waitFor(() => expect(report.verdict.loading.value).toBe(false))
    expect(report.verdict.error.value).toBe('network down')
    expect(report.verdict.data.value).toBeNull()
  })

  it('retries the fetch when load() is called after an error', async () => {
    vi.mocked(getVerdict).mockRejectedValueOnce(new Error('network down'))
    const report = useReport('sample-id-7')
    await vi.waitFor(() => expect(report.verdict.error.value).toBe('network down'))
    await report.verdict.load()
    await vi.waitFor(() => expect(report.verdict.loading.value).toBe(false))
    expect(report.verdict.data.value).toEqual({ verdict: 'Malicious' })
    expect(report.verdict.error.value).toBeNull()
    expect(getVerdict).toHaveBeenCalledTimes(2)
  })

  it('keys sections by report id so two reports do not share data', async () => {
    vi.mocked(getVerdict).mockResolvedValueOnce({ verdict: 'Safe' } as never)
    const first = useReport('sample-id-5')
    const second = useReport('sample-id-6')
    await vi.waitFor(() => expect(first.verdict.loading.value).toBe(false))
    await vi.waitFor(() => expect(second.verdict.loading.value).toBe(false))
    expect(first.verdict.data.value).toEqual({ verdict: 'Safe' })
    expect(second.verdict.data.value).toEqual({ verdict: 'Malicious' })
  })
})
