<script setup lang="ts">
import { computed, inject, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import KeyValueList from '../../ui/KeyValueList.vue'
import ContainedList from '../../ui/ContainedList.vue'
import InlineNotification from '../../ui/InlineNotification.vue'
import type { KeyValueRow } from '../../ui/types'
import { REPORT_INJECTION_KEY, isPending } from '../../../composables/useReport'
import { asRecord, asText } from '../../../domain/raw'
import { categoryLabel } from '../../../domain/subVerdicts'
import { toFuzzyHashes, toIdentifiedFiles } from '../../../domain/fingerprints'

const { t } = useI18n()
const report = inject(REPORT_INJECTION_KEY)!
const section = report.fingerprints

onMounted(() => {
  section.load()
})

const pending = computed(() => isPending(section))
const showBody = computed(() => pending.value || section.data.value !== null)

const checksumRows = computed<KeyValueRow[]>(() => {
  const checksums = asRecord(section.data.value?.checksums)
  const entries: [string, string, boolean][] = [
    ['size', t('fingerprints.size'), false],
    ['sha256', 'SHA-256', true],
    ['sha1', 'SHA-1', true],
    ['md5', 'MD5', true],
  ]
  return entries.flatMap(([key, label, isHash]) => {
    const value = asText(checksums[key])
    return value ? [{ id: key, label, value, mono: isHash, copy: isHash }] : []
  })
})

const identifierRows = computed(() =>
  toIdentifiedFiles(section.data.value?.identifiers).map((file) => ({
    id: file.id,
    title: file.filename ?? t('fingerprints.apkFile'),
    mono: file.filename !== null,
    tags: file.matches.map((match) => ({ label: `${categoryLabel(match.category, t)}: ${match.value}`, kind: 'gold' as const })),
  })),
)

const fuzzyRows = computed<KeyValueRow[]>(() =>
  toFuzzyHashes(section.data.value?.fuzzy_hashes).map((entry) => ({
    id: entry.id,
    label: entry.filename ?? t('fingerprints.unknownFilename'),
    value: entry.hash,
    mono: true,
    copy: true,
  })),
)
</script>

<template>
  <div>
    <InlineNotification v-if="section.error.value" class="section-error">{{ section.error.value }}</InlineNotification>
    <template v-if="showBody">
      <KeyValueList :title="t('fingerprints.checksumsTitle')" :rows="checksumRows" :loading="pending" :empty-text="t('fingerprints.noChecksums')" />
      <ContainedList :title="t('fingerprints.identifiersTitle')" :rows="identifierRows" :loading="pending" :empty-text="t('fingerprints.noIdentifiers')" />
      <KeyValueList :title="t('fingerprints.fingerprintsTitle')" :rows="fuzzyRows" :loading="pending" :empty-text="t('fingerprints.noFuzzyHashes')" />
    </template>
  </div>
</template>
