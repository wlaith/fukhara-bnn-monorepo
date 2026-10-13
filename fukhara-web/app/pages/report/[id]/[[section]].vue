<script setup lang="ts">
import { computed, provide } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocalizedNavigation } from '~/composables/useLocalizedNavigation'
import ReportHeader from '~/components/report/ReportHeader.vue'
import VerdictBanner from '~/components/report/VerdictBanner.vue'
import SubVerdictGrid from '~/components/report/SubVerdictGrid.vue'
import VerticalTabs from '~/components/ui/VerticalTabs.vue'
import ControlFlowSection from '~/components/report/sections/ControlFlowSection.vue'
import BehaviorAnalysisSection from '~/components/report/sections/BehaviorAnalysisSection.vue'
import AppInformationSection from '~/components/report/sections/AppInformationSection.vue'
import ThreatIntelligenceSection from '~/components/report/sections/ThreatIntelligenceSection.vue'
import NetworkSection from '~/components/report/sections/NetworkSection.vue'
import FingerprintsSection from '~/components/report/sections/FingerprintsSection.vue'
import CodeAnalysisSection from '~/components/report/sections/CodeAnalysisSection.vue'
import { useReport, REPORT_INJECTION_KEY } from '~/composables/useReport'

definePageMeta({
  name: 'report',
  key: (route) => String(route.params.id),
})

const { t } = useI18n()
const route = useRoute()
const { replace } = useLocalizedNavigation()

const report = useReport(route.params.id as string)
provide(REPORT_INJECTION_KEY, report)

const apkDetails = computed(() => report.appAnalysis.data.value?.apk_details)

const TABS = computed(() => [
  { id: 'code-analysis', label: t('reportView.tabs.codeAnalysis') },
  { id: 'behavior-analysis', label: t('reportView.tabs.behaviorAnalysis') },
  { id: 'app-information', label: t('reportView.tabs.appInformation') },
  { id: 'threat-intelligence', label: t('reportView.tabs.threatIntelligence') },
  { id: 'network', label: t('reportView.tabs.network') },
  { id: 'fingerprints', label: t('reportView.tabs.fingerprints') },
  { id: 'control-flow', label: t('reportView.tabs.controlFlow') },
])

const SECTION_COMPONENTS: Record<string, unknown> = {
  'behavior-analysis': BehaviorAnalysisSection,
  'app-information': AppInformationSection,
  'control-flow': ControlFlowSection,
  'threat-intelligence': ThreatIntelligenceSection,
  'network': NetworkSection,
  'fingerprints': FingerprintsSection,
  'code-analysis': CodeAnalysisSection,
}

const activeSection = computed(() => (route.params.section as string) || 'code-analysis')
const activeComponent = computed(() => SECTION_COMPONENTS[activeSection.value] ?? null)

function onSelectTab(id: string) {
  replace({ name: 'report', params: { id: route.params.id, section: id } })
}
</script>

<template>
  <main class="flex flex-col ">
    <ReportHeader
      v-if="apkDetails?.app_name || apkDetails?.package"
      class="page-shell border-subtle"
      :app-name="apkDetails.app_name ?? undefined"
      :package-name="apkDetails.package ?? undefined"
    />
    <VerdictBanner
      v-if="report.verdict.data.value?.verdict"
      class="page-shell border-subtle"
      :verdict="report.verdict.data.value.verdict ?? undefined"
      :severity="report.verdict.data.value.severity ?? undefined"
      :reason="report.verdict.data.value.reason ?? undefined"
      :response="report.verdict.data.value.response ?? undefined"
    />
    <SubVerdictGrid class="page-shell border-subtle" :report="report" />
    <div class="page-shell flex flex-col border-subtle box-content lg:flex-row">
      <VerticalTabs :items="TABS" :active-id="activeSection" @select="onSelectTab" />
      <div class="flex-1  border-subtle w-full text-wrap">
        <component :is="activeComponent" v-if="activeComponent" />
      </div>
    </div>
  </main>
</template>
