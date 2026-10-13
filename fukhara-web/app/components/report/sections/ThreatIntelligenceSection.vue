<script setup lang="ts">
import { computed, inject, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ContainedList from '../../ui/ContainedList.vue'
import KeyValueList from '../../ui/KeyValueList.vue'
import InlineNotification from '../../ui/InlineNotification.vue'
import type { KeyValueRow } from '../../ui/types'
import { REPORT_INJECTION_KEY, isPending } from '../../../composables/useReport'
import { formatTimestamp } from '../../../domain/format'
import {
  toAvDetections,
  toExternalReports,
  toTimeline,
  toYaraMatches,
  virusTotalAvailable,
} from '../../../domain/threatIntelligence'

const { t, locale } = useI18n()
const report = inject(REPORT_INJECTION_KEY)!
const section = report.threatIntelligence

onMounted(() => {
  section.load()
})

const pending = computed(() => isPending(section))
const data = computed(() => section.data.value)

const yaraRows = computed(() =>
  toYaraMatches(data.value?.yara_matches).map((match) => ({
    id: match.id,
    title: match.source ?? t('threatIntelligence.unknownSource'),
    mono: true,
    tags: match.rules.map((rule) => ({ label: rule, kind: 'gold' as const })),
  })),
)

const hasVirusTotal = computed(() => virusTotalAvailable(data.value?.third_party_apps, data.value?.av_detections))

const avRows = computed(() =>
  toAvDetections(data.value?.av_detections).map((detection) => ({
    id: detection.name,
    title: detection.name,
    tags: [{ label: t('threatIntelligence.avCount', { count: detection.count }, detection.count), kind: 'red' as const }],
  })),
)

const timelineRows = computed<KeyValueRow[]>(() =>
  toTimeline(data.value?.sample_timeline).map((event) => ({
    id: event.key,
    label: t(`threatIntelligence.timeline.${event.key}`),
    value: formatTimestamp(event.value, locale.value, true),
  })),
)

const externalRows = computed<KeyValueRow[]>(() => {
  const links = toExternalReports(data.value?.third_party_apps)
  const rows: KeyValueRow[] = []
  if (links.virusTotal) rows.push({ id: 'vt', label: 'VirusTotal', value: t('threatIntelligence.openReportFor', { service: 'VirusTotal' }), href: links.virusTotal })
  if (links.malwareBazaar) rows.push({ id: 'mb', label: 'MalwareBazaar', value: t('threatIntelligence.openReportFor', { service: 'MalwareBazaar' }), href: links.malwareBazaar })
  return rows
})
</script>

<template>
  <div>
    <InlineNotification v-if="section.error.value" class="section-error">{{ section.error.value }}</InlineNotification>

    <ContainedList
      v-if="pending || data !== null"
      :title="t('threatIntelligence.yaraMatchesTitle')"
      :rows="yaraRows"
      :loading="pending"
      :empty-text="t('threatIntelligence.noYara')"
    />

    <template v-if="!pending && data !== null">
      <template v-if="hasVirusTotal">
        <ContainedList :title="t('threatIntelligence.avTitle')" :rows="avRows" :empty-text="t('threatIntelligence.noAv')" />
        <KeyValueList :title="t('threatIntelligence.timelineTitle')" :rows="timelineRows" :empty-text="t('threatIntelligence.noTimeline')" />
      </template>

      <KeyValueList v-if="externalRows.length" :title="t('threatIntelligence.externalTitle')" :rows="externalRows" />
    </template>
  </div>
</template>
