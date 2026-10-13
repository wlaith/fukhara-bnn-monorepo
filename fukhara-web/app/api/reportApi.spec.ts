import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('reportApi (mock mode)', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('analyzeApk returns the sample report id', async () => {
    const { analyzeApk } = await import('./reportApi')
    const file = new File(['content'], 'sample.apk')
    const result = await analyzeApk(file)
    expect(result.status).toBe('success')
    expect(result.id).toMatch(/^[0-9a-f]{64}$/)
  })

  it('getVerdict returns the verdict fixture', async () => {
    const { getVerdict } = await import('./reportApi')
    const result = await getVerdict('any-id')
    expect(result?.verdict).toBe('Malicious')
  })

  it('getFingerprints returns checksums, identifiers, and fuzzy hashes', async () => {
    const { getFingerprints } = await import('./reportApi')
    const result = await getFingerprints('any-id')
    expect(result.checksums?.sha256).toMatch(/^[0-9a-f]{64}$/)
    expect(result.identifiers).not.toBeNull()
  })

  it('getBehaviorAnalysis returns threats and permissions', async () => {
    const { getBehaviorAnalysis } = await import('./reportApi')
    const result = await getBehaviorAnalysis('any-id')
    expect(Array.isArray(result.threats)).toBe(true)
    expect(result.permissions).not.toBeNull()
  })

  it('getNetworkAnalysis returns domains and urls', async () => {
    const { getNetworkAnalysis } = await import('./reportApi')
    const result = await getNetworkAnalysis('any-id')
    expect(result.domains).not.toBeNull()
    expect(Array.isArray(result.urls)).toBe(true)
  })
})
