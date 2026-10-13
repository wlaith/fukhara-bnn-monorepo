import { ref } from 'vue'
import { ApiError } from '~/api/client'
import type { AnalysisStatus } from '~/api/reportApi'
import type { Translate } from '~/domain/translate'

const STEP_DURATION_MS = 2000
const POLL_INTERVAL_MS = 3000
const MAX_WAIT_MS = 15 * 60 * 1000
const MAX_CONSECUTIVE_ERRORS = 5


export function useAnalysisProgress(
  onComplete: () => void,
  t: Translate,
  fetchStatus?: () => Promise<AnalysisStatus>,
) {
  function steps(): string[] {
    return [
      t('analyzingView.steps.uploading'),
      t('analyzingView.steps.staticAnalysis'),
      t('analyzingView.steps.threatIntelligence'),
      t('analyzingView.steps.generatingReport'),
    ]
  }

  const stepIndex = ref(0)
  const stepLabel = ref(steps()[0] ?? '')
  const percent = ref(0)
  const error = ref<string | null>(null)
  let timer: ReturnType<typeof setInterval> | null = null
  let pollTimer: ReturnType<typeof setTimeout> | null = null
  let polling = false

  function setStep(index: number) {
    stepIndex.value = index
    stepLabel.value = steps()[index] ?? ''
  }

  function start() {
    if (fetchStatus) startPolling(fetchStatus)
    else startTimer()
  }

  function startTimer() {
    if (timer) return
    const currentSteps = steps()
    timer = setInterval(() => {
      stepIndex.value += 1
      if (stepIndex.value >= currentSteps.length) {
        percent.value = 100
        stop()
        onComplete()
        return
      }
      stepLabel.value = currentSteps[stepIndex.value] ?? ''
      percent.value = Math.round((stepIndex.value / currentSteps.length) * 100)
    }, STEP_DURATION_MS)
  }

  function startPolling(fetch: () => Promise<AnalysisStatus>) {
    if (polling) return
    polling = true
    const startedAt = Date.now()
    let consecutiveErrors = 0

    function fail(message: string) {
      error.value = message
      stop()
    }

    async function poll() {
      pollTimer = null
      try {
        const status = await fetch()
        if (!polling) return
        consecutiveErrors = 0

        if (status.status === 'completed') {
          setStep(steps().length - 1)
          percent.value = 100
          stop()
          onComplete()
          return
        }
        if (status.status === 'failed') return fail(t('analyzingView.errors.failed'))

        const fraction = status.toolsTotal > 0 ? status.toolsDone / status.toolsTotal : 0
        setStep(fraction < 0.5 ? 1 : 2)
        percent.value = Math.min(95, Math.round(fraction * 95))
      } catch (err) {
        if (!polling) return
        if (err instanceof ApiError && err.status === 404) {
          return fail(t('analyzingView.errors.notFound'))
        }
        consecutiveErrors += 1
        if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
          return fail(t('analyzingView.errors.unreachable'))
        }
      }

      if (Date.now() - startedAt >= MAX_WAIT_MS) return fail(t('analyzingView.errors.timeout'))
      pollTimer = setTimeout(poll, POLL_INTERVAL_MS)
    }

    void poll()
  }

  function stop() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    if (pollTimer) {
      clearTimeout(pollTimer)
      pollTimer = null
    }
    polling = false
  }

  return { stepLabel, percent, error, start, stop }
}
