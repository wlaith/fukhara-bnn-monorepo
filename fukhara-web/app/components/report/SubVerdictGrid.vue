<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import SubVerdictCard from './SubVerdictCard.vue'
import { useSubVerdicts } from '../../composables/useSubVerdicts'
import type { ReportContext } from '../../composables/useReport'

const props = defineProps<{ report: ReportContext }>()
const { t } = useI18n()
const subVerdicts = useSubVerdicts(props.report, t)
</script>

<template>
  <div class="grid grid-cols-1 border-subtle md:grid-cols-2 lg:grid-cols-3">
    <SubVerdictCard v-if="subVerdicts.codeAnalysis.value" :label="t('reportView.tabs.codeAnalysis')" :sub-verdict="subVerdicts.codeAnalysis.value" />
    <SubVerdictCard v-if="subVerdicts.behaviorAnalysis.value" :label="t('reportView.tabs.behaviorAnalysis')" :sub-verdict="subVerdicts.behaviorAnalysis.value" />
    <SubVerdictCard v-if="subVerdicts.appInformation.value" :label="t('reportView.tabs.appInformation')" :sub-verdict="subVerdicts.appInformation.value" />
    <SubVerdictCard v-if="subVerdicts.threatIntelligence.value" :label="t('reportView.tabs.threatIntelligence')" :sub-verdict="subVerdicts.threatIntelligence.value" />
    <SubVerdictCard v-if="subVerdicts.network.value" :label="t('reportView.tabs.network')" :sub-verdict="subVerdicts.network.value" />
    <SubVerdictCard v-if="subVerdicts.fingerprints.value" :label="t('reportView.tabs.fingerprints')" :sub-verdict="subVerdicts.fingerprints.value" />
  </div>
</template>
