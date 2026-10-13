import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useAnalysisProgress } from './useAnalysisProgress'
import i18n from '~/test-utils/i18n'
import en from '../../i18n/locales/en.json'
import { ApiError } from '~/api/client'

describe('useAnalysisProgress', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts at the first step label and 0%', () => {
    const { stepLabel, percent } = useAnalysisProgress(() => {}, i18n.global.t)
    expect(stepLabel.value).toBe('Uploading file')
    expect(percent.value).toBe(0)
  })

  it('advances through steps and increases percent as time passes', () => {
    const { stepLabel, percent, start } = useAnalysisProgress(() => {}, i18n.global.t)
    start()
    vi.advanceTimersByTime(2000)
    expect(stepLabel.value).toBe('Running static analysis')
    expect(percent.value).toBeGreaterThan(0)
  })

  it('calls onComplete once all steps finish', () => {
    const onComplete = vi.fn()
    const { start } = useAnalysisProgress(onComplete, i18n.global.t)
    start()
    vi.advanceTimersByTime(10000)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('stop() prevents further step advancement', () => {
    const { stepLabel, start, stop } = useAnalysisProgress(() => {}, i18n.global.t)
    start()
    vi.advanceTimersByTime(2000)
    stop()
    const labelAfterStop = stepLabel.value
    vi.advanceTimersByTime(8000)
    expect(stepLabel.value).toBe(labelAfterStop)
  })

  it('uses Arabic step labels when the locale is ar', () => {
    i18n.global.locale.value = 'ar'
    const { stepLabel } = useAnalysisProgress(() => {}, i18n.global.t)
    expect(stepLabel.value).toBe('جارٍ رفع الملف')
    i18n.global.locale.value = 'en'
  })
})

describe('useAnalysisProgress translator argument', () => {
  it('builds step labels with the supplied t, not shared locale state', () => {
    i18n.global.locale.value = 'ar'
    const { stepLabel } = useAnalysisProgress(() => {}, ((key: string) => `fake:${key}`) as never)
    expect(stepLabel.value).toBe('fake:analyzingView.steps.uploading')
    i18n.global.locale.value = 'en'
  })
})

describe('useAnalysisProgress with a status source', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const pending = (toolsDone: number) => ({ status: 'pending' as const, toolsDone, toolsTotal: 8 })

  it('follows the reported tool progress', async () => {
    const fetchStatus = vi.fn().mockResolvedValueOnce(pending(2)).mockResolvedValueOnce(pending(6))
    const { stepLabel, percent, start, stop } = useAnalysisProgress(
      () => {},
      i18n.global.t,
      fetchStatus,
    )
    start()
    await vi.advanceTimersByTimeAsync(0)
    expect(stepLabel.value).toBe('Running static analysis')
    expect(percent.value).toBe(24)
    await vi.advanceTimersByTimeAsync(3000)
    expect(stepLabel.value).toBe('Checking threat intelligence')
    expect(percent.value).toBe(71)
    stop()
  })

  it('calls onComplete once the analysis completes', async () => {
    const onComplete = vi.fn()
    const fetchStatus = vi
      .fn()
      .mockResolvedValueOnce(pending(4))
      .mockResolvedValueOnce({ status: 'completed', toolsDone: 8, toolsTotal: 8 })
    const { percent, start } = useAnalysisProgress(onComplete, i18n.global.t, fetchStatus)
    start()
    await vi.advanceTimersByTimeAsync(3000)
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(percent.value).toBe(100)
    await vi.advanceTimersByTimeAsync(30000)
    expect(fetchStatus).toHaveBeenCalledTimes(2)
  })

  it('reports a failed analysis and stops polling', async () => {
    const fetchStatus = vi.fn().mockResolvedValue({ status: 'failed', toolsDone: 8, toolsTotal: 8 })
    const onComplete = vi.fn()
    const { error, start } = useAnalysisProgress(onComplete, i18n.global.t, fetchStatus)
    start()
    await vi.advanceTimersByTimeAsync(30000)
    expect(error.value).toBe(en.analyzingView.errors.failed)
    expect(fetchStatus).toHaveBeenCalledTimes(1)
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('reports an unknown analysis on a 404', async () => {
    const fetchStatus = vi.fn().mockRejectedValue(new ApiError(404, 'not found'))
    const { error, start } = useAnalysisProgress(() => {}, i18n.global.t, fetchStatus)
    start()
    await vi.advanceTimersByTimeAsync(0)
    expect(error.value).toBe(en.analyzingView.errors.notFound)
  })

  it('retries transient errors before giving up', async () => {
    const fetchStatus = vi.fn().mockRejectedValue(new ApiError(502, 'bad gateway'))
    const { error, start } = useAnalysisProgress(() => {}, i18n.global.t, fetchStatus)
    start()
    await vi.advanceTimersByTimeAsync(3000 * 3)
    expect(error.value).toBeNull()
    await vi.advanceTimersByTimeAsync(3000)
    expect(error.value).toBe(en.analyzingView.errors.unreachable)
    expect(fetchStatus).toHaveBeenCalledTimes(5)
  })

  it('gives up after the maximum wait', async () => {
    const fetchStatus = vi.fn().mockResolvedValue(pending(1))
    const { error, start } = useAnalysisProgress(() => {}, i18n.global.t, fetchStatus)
    start()
    await vi.advanceTimersByTimeAsync(15 * 60 * 1000)
    expect(error.value).toBe(en.analyzingView.errors.timeout)
  })

  it('stop() prevents further polling', async () => {
    const fetchStatus = vi.fn().mockResolvedValue(pending(1))
    const { start, stop } = useAnalysisProgress(() => {}, i18n.global.t, fetchStatus)
    start()
    await vi.advanceTimersByTimeAsync(0)
    stop()
    await vi.advanceTimersByTimeAsync(30000)
    expect(fetchStatus).toHaveBeenCalledTimes(1)
  })
})
