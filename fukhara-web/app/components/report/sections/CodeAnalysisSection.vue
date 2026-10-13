<script setup lang="ts">
import { computed, inject, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Tabs from '../../ui/Tabs.vue'
import Tag from '../../ui/Tag.vue'
import ExpandableList from '../../ui/ExpandableList.vue'
import InlineNotification from '../../ui/InlineNotification.vue'
import AffectedFilesList from '../../ui/AffectedFilesList.vue'
import { REPORT_INJECTION_KEY, isPending } from '../../../composables/useReport'
import { severityKind, severityLabel, type Severity } from '../../../domain/severity'
import { toCodeVulnerabilities } from '../../../domain/codeVulnerabilities'

const { t } = useI18n()
const report = inject(REPORT_INJECTION_KEY)!

onMounted(() => {
  report.codeAnalysis.load()
})

type SeverityFilter = Severity | 'all'

const SEVERITY_TABS = computed<{ id: SeverityFilter; label: string }[]>(() => [
  { id: 'all', label: t('severity.all') },
  { id: 'high', label: severityLabel('high', t) },
  { id: 'warning', label: severityLabel('warning', t) },
  { id: 'info', label: severityLabel('info', t) },
  { id: 'good', label: severityLabel('good', t) },
])

const SEVERITIES: readonly SeverityFilter[] = ['all', 'high', 'warning', 'info', 'good']

function isSeverityFilter(value: string): value is SeverityFilter {
  return (SEVERITIES as readonly string[]).includes(value)
}

const activeSeverity = ref<SeverityFilter>('all')

function onSelectSeverity(id: string) {
  if (isSeverityFilter(id)) {
    activeSeverity.value = id
  }
}

const showBody = computed(() => isPending(report.codeAnalysis) || report.codeAnalysis.data.value !== null)

const vulnerabilities = computed(() =>
  toCodeVulnerabilities(report.codeAnalysis.data.value?.code_vulnerabilities),
)

const filteredVulnerabilities = computed(() =>
  activeSeverity.value === 'all'
    ? vulnerabilities.value
    : vulnerabilities.value.filter((v) => v.severity === activeSeverity.value),
)

const listTitle = computed(() =>
  activeSeverity.value === 'all'
    ? t('codeAnalysis.listTitleAll', { total: vulnerabilities.value.length })
    : t('codeAnalysis.listTitle', {
        count: filteredVulnerabilities.value.length,
        total: vulnerabilities.value.length,
      }),
)
</script>

<template>
  <div>
    <InlineNotification v-if="report.codeAnalysis.error.value" class="section-error">{{ report.codeAnalysis.error.value }}</InlineNotification>
    <template v-if="showBody">
      <Tabs :items="SEVERITY_TABS" :active-id="activeSeverity" @select="onSelectSeverity" />
      <ExpandableList :title="listTitle" :items="filteredVulnerabilities" :loading="isPending(report.codeAnalysis)">
        <template #title="{ item }"><bdi dir="auto">{{ item.title }}</bdi></template>

        <template #subtitle="{ item, open }">
          <span v-if="item.description" class="vuln-subtitle max-w-[72ch]" :class="open ? 'block' : 'line-clamp-1'">
            <bdi dir="auto">{{ item.description }}</bdi>
          </span>
        </template>

        <template #summary="{ item }">
          <Tag v-if="item.severity" :kind="severityKind(item.severity)" size="compact" class="vuln-tag--severity">
            {{ severityLabel(item.severity, t) }}
          </Tag>
          <Tag v-if="item.cweId" kind="gray" size="compact" dir="ltr" class="vuln-tag--cwe">{{ item.cweId }}</Tag>
          <Tag v-if="item.cvss !== null" kind="gray" size="compact" dir="ltr" class="vuln-tag--cvss">
            {{ t('codeAnalysis.cvss', { score: item.cvss.toFixed(1) }) }}
          </Tag>
          <Tag v-if="item.masvs" kind="gray" size="compact" dir="ltr" class="vuln-tag--masvs">{{ item.masvs }}</Tag>
          <span v-if="item.files.length" class="font-body text-caption text-helper">
            {{ t('codeAnalysis.filesCount', { count: item.files.length }) }}
          </span>
        </template>

        <template #detail="{ item }">
          <div class="flex flex-col gap-6">
            <AffectedFilesList :files="item.files" />

            <dl v-if="item.owaspMobile" class="vuln-detail__owasp m-0 flex flex-col gap-1">
              <dt class="font-body text-label tracking-label text-helper">{{ t('codeAnalysis.owaspMobile') }}</dt>
              <dd class="m-0 font-body text-body text-primary"><bdi dir="auto">{{ item.owaspMobile }}</bdi></dd>
            </dl>

            <a
              v-if="item.referenceUrl"
              :href="item.referenceUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="vuln-detail__reference inline-flex w-fit items-center gap-1 font-body text-body text-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {{ t('codeAnalysis.learnMore') }}
              <svg class="h-4 w-4 fill-current rtl:-scale-x-100" viewBox="0 0 32 32" aria-hidden="true">
                <polygon points="10 6 10 8 22.59 8 6 24.59 7.41 26 24 9.41 24 22 26 22 26 6 10 6" />
              </svg>
              <span class="sr-only">{{ t('codeAnalysis.opensInNewTab') }}</span>
            </a>
          </div>
        </template>
      </ExpandableList>
    </template>
  </div>
</template>
