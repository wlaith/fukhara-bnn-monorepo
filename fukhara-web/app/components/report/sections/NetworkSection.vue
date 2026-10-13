<script setup lang="ts">
import { computed, inject, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Tabs from '../../ui/Tabs.vue'
import Tag from '../../ui/Tag.vue'
import ExpandableList from '../../ui/ExpandableList.vue'
import KeyValueList from '../../ui/KeyValueList.vue'
import CopyButton from '../../ui/CopyButton.vue'
import InlineNotification from '../../ui/InlineNotification.vue'
import type { KeyValueRow } from '../../ui/types'
import { REPORT_INJECTION_KEY, isPending } from '../../../composables/useReport'
import { countUrls, toDomains, toUrlGroups, type Domain } from '../../../domain/network'

const { t } = useI18n()
const report = inject(REPORT_INJECTION_KEY)!
const section = report.networkAnalysis

onMounted(() => {
  section.load()
})

const pending = computed(() => isPending(section))
const showBody = computed(() => pending.value || section.data.value !== null)
const domains = computed(() => toDomains(section.data.value?.domains))
const urlGroups = computed(() => toUrlGroups(section.data.value?.urls))

const VIEWS = ['domains', 'urls'] as const
type View = (typeof VIEWS)[number]
const activeView = ref<View>('domains')
const viewTabs = computed(() => [
  { id: 'domains', label: t('network.domainsTab', { count: domains.value.length }) },
  { id: 'urls', label: t('network.urlsTab', { count: countUrls(urlGroups.value) }) },
])

function onSelectView(id: string) {
  const view = VIEWS.find((v) => v === id)
  if (view) activeView.value = view
}

function domainRows(domain: Domain): KeyValueRow[] {
  const rows: KeyValueRow[] = []
  if (domain.ip) rows.push({ id: 'ip', label: t('network.ip'), value: domain.ip, mono: true, copy: true })
  if (domain.location) rows.push({ id: 'location', label: t('network.location'), value: domain.location, scanner: true })
  if (domain.coordinates) rows.push({ id: 'coordinates', label: t('network.coordinates'), value: domain.coordinates, mono: true })
  return rows
}
</script>

<template>
  <div>
    <InlineNotification v-if="section.error.value" class="section-error">{{ section.error.value }}</InlineNotification>
    <template v-if="showBody">
      <Tabs :items="viewTabs" :active-id="activeView" @select="onSelectView" />

      <ExpandableList
        v-if="activeView === 'domains'"
        :title="t('network.domainsTitle')"
        :items="domains"
        :loading="pending"
        :empty-text="t('network.noDomains')"
      >
        <template #title="{ item }"><bdi dir="ltr" class="break-all font-mono text-caption">{{ item.name }}</bdi></template>
        <template #summary="{ item }">
          <Tag v-if="item.malicious" kind="red" size="compact">{{ t('network.malicious') }}</Tag>
          <Tag v-if="item.ofac" kind="red" size="compact">{{ t('network.ofac') }}</Tag>
          <Tag v-if="item.country" kind="gray" size="compact" dir="auto">{{ item.country }}</Tag>
        </template>
        <template #detail="{ item }">
          <div class="flex flex-col gap-4">
            <p v-if="item.ofac" class="m-0 font-body text-caption text-secondary">{{ t('network.ofacNote') }}</p>
            <KeyValueList :rows="domainRows(item)" :empty-text="t('network.noGeolocation')" />
          </div>
        </template>
      </ExpandableList>

      <ExpandableList
        v-else
        :title="t('network.urlsTitle')"
        :items="urlGroups"
        :loading="pending"
        :empty-text="t('network.noUrls')"
      >
        <template #title="{ item }">
          <bdi dir="ltr" class="break-all font-mono text-caption">{{ item.path ?? t('network.unknownSource') }}</bdi>
        </template>
        <template #summary="{ item }">
          <span class="font-body text-caption text-helper">{{ t('network.urlCount', { count: item.urls.length }) }}</span>
        </template>
        <template #detail="{ item }">
          <div class="flex flex-col gap-2">
            <p class="m-0 font-body text-caption text-helper">{{ t('network.urlsNote') }}</p>
            <ul class="m-0 list-none border border-subtle bg-canvas p-0">
              <li
                v-for="url in item.urls"
                :key="url"
                class="flex items-start justify-between gap-2 border-t border-t-subtle px-3 py-2 first:border-t-0"
              >
                <code dir="ltr" class="min-w-0 break-all text-start font-mono text-caption text-primary">{{ url }}</code>
                <CopyButton :value="url" :label="t('network.url')" />
              </li>
            </ul>
          </div>
        </template>
      </ExpandableList>
    </template>
  </div>
</template>
