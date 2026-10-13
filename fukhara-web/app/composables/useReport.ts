import { computed, type InjectionKey, type Ref } from 'vue'
import {
  getVerdict,
  getFingerprints,
  getThreatIntelligence,
  getAppAnalysis,
  getCodeAnalysis,
  getBehaviorAnalysis,
  getNetworkAnalysis,
} from '../api/reportApi'

interface Section<T> {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<string | null>
  load: () => Promise<void>
}

function createSection<T>(key: string, fetcher: () => Promise<T>): Section<T> {
  const { data, status, error, refresh } = useAsyncData<T | null>(key, fetcher, {
    default: () => null,
  })

  return {
    data: data as Ref<T | null>,
    loading: computed(() => status.value === 'pending'),
    error: computed(() => error.value?.message ?? null),
    load: async () => {
      if (status.value === 'idle' || status.value === 'error') await refresh()
    },
  }
}

//true until the first response arrives, so lists show a skeleton instead of "No findings".
export function isPending(section: {
  data: { readonly value: unknown }
  loading: { readonly value: boolean }
  error: { readonly value: string | null }
}): boolean {
  return section.loading.value || (section.data.value === null && section.error.value === null)
}

export function useReport(id: string) {
  const key = (section: string) => `report:${id}:${section}`
  return {
    verdict: createSection(key('verdict'), () => getVerdict(id)),
    fingerprints: createSection(key('fingerprints'), () => getFingerprints(id)),
    threatIntelligence: createSection(key('threat-intelligence'), () => getThreatIntelligence(id)),
    appAnalysis: createSection(key('app-analysis'), () => getAppAnalysis(id)),
    codeAnalysis: createSection(key('code-analysis'), () => getCodeAnalysis(id)),
    behaviorAnalysis: createSection(key('behavior-analysis'), () => getBehaviorAnalysis(id)),
    networkAnalysis: createSection(key('network-analysis'), () => getNetworkAnalysis(id)),
  }
}

export type ReportContext = ReturnType<typeof useReport>
export const REPORT_INJECTION_KEY: InjectionKey<ReportContext> = Symbol('report')
