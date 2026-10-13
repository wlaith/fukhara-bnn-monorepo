<script setup lang="ts">
import { computed, inject, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Tag from '../../ui/Tag.vue'
import KeyValueList from '../../ui/KeyValueList.vue'
import ExpandableList from '../../ui/ExpandableList.vue'
import InlineNotification from '../../ui/InlineNotification.vue'
import type { KeyValueRow, TagSpec } from '../../ui/types'
import applicationIcon from '~/assets/icons/application.svg'
import shieldIcon from '~/assets/icons/shield.svg'
import sourceIcon from '~/assets/icons/source.svg'
import { REPORT_INJECTION_KEY, isPending } from '../../../composables/useReport'
import { formatTimestamp } from '../../../domain/format'
import { severityKind, severityLabel } from '../../../domain/severity'
import { toAppDetails, toCertificate, toComponents, toManifestFindings } from '../../../domain/appInformation'

const { t, locale } = useI18n()
const report = inject(REPORT_INJECTION_KEY)!
const section = report.appAnalysis

onMounted(() => {
  section.load()
})

const pending = computed(() => isPending(section))
const showBody = computed(() => pending.value || section.data.value !== null)
const data = computed(() => section.data.value)

const detailRows = computed<KeyValueRow[]>(() => {
  const details = toAppDetails(data.value?.apk_details)
  if (!details) return []
  const rows: KeyValueRow[] = []
  if (details.appName) rows.push({ id: 'name', label: t('appInformation.appName'), value: details.appName, scanner: true })
  if (details.packageName) rows.push({ id: 'package', label: t('appInformation.package'), value: details.packageName, mono: true, copy: true })
  if (details.versionName) {
    rows.push({
      id: 'version',
      label: t('appInformation.version'),
      value: details.versionCode === null
        ? details.versionName
        : t('appInformation.versionValue', { name: details.versionName, code: details.versionCode }),
    })
  }
  if (details.minSdk) {
    rows.push({
      id: 'sdk',
      label: t('appInformation.sdk'),
      value: details.maxSdk
        ? t('appInformation.sdkRange', { min: details.minSdk, max: details.maxSdk })
        : t('appInformation.sdkMin', { min: details.minSdk }),
    })
  }
  if (details.signed !== null) {
    const tags: TagSpec[] = [
      details.signed
        ? { label: t('appInformation.signed'), kind: 'gray' }
        : { label: t('appInformation.unsigned'), kind: 'red' },
      ...details.signatureSchemes
        .filter((scheme) => scheme.enabled)
        .map((scheme) => ({ label: t('appInformation.scheme', { version: scheme.version }), kind: 'gray' as const })),
    ]
    rows.push({ id: 'signing', label: t('appInformation.signing'), tags })
  }
  return rows
})

const VALIDITY_TAG = {
  valid: { key: 'appInformation.certValid', kind: 'gray' },
  expired: { key: 'appInformation.certExpired', kind: 'gold' },
  'not-yet-valid': { key: 'appInformation.certNotYetValid', kind: 'gold' },
} as const

const certificateRows = computed<KeyValueRow[]>(() => {
  const certificate = toCertificate(data.value?.certificate_details, new Date())
  if (!certificate) return []
  const rows: KeyValueRow[] = []
  if (certificate.validity) {
    const tag = VALIDITY_TAG[certificate.validity]
    rows.push({ id: 'status', label: t('appInformation.validity'), tags: [{ label: t(tag.key), kind: tag.kind }] })
  }
  if (certificate.issuer) rows.push({ id: 'issuer', label: t('appInformation.issuer'), value: certificate.issuer, scanner: true })
  if (certificate.notBefore) rows.push({ id: 'from', label: t('appInformation.validFrom'), value: formatTimestamp(certificate.notBefore, locale.value) })
  if (certificate.notAfter) rows.push({ id: 'to', label: t('appInformation.validTo'), value: formatTimestamp(certificate.notAfter, locale.value) })
  if (certificate.sha256) rows.push({ id: 'sha256', label: 'SHA-256', value: certificate.sha256, mono: true, copy: true })
  if (certificate.sha1) rows.push({ id: 'sha1', label: 'SHA-1', value: certificate.sha1, mono: true, copy: true })
  if (certificate.md5) rows.push({ id: 'md5', label: 'MD5', value: certificate.md5, mono: true, copy: true })
  return rows
})

const components = computed(() =>
  toComponents(data.value?.activities, data.value?.receivers, data.value?.services),
)
const componentGroups = computed(() =>
  [
    { id: 'activities', label: t('appInformation.activities', { count: components.value.activities.length }), names: components.value.activities },
    { id: 'receivers', label: t('appInformation.receivers', { count: components.value.receivers.length }), names: components.value.receivers },
    { id: 'services', label: t('appInformation.services', { count: components.value.services.length }), names: components.value.services },
  ].filter((group) => group.names.length > 0),
)

const manifestFindings = computed(() => toManifestFindings(data.value?.manifest_analysis))
</script>

<template>
  <div>
    <InlineNotification v-if="section.error.value" class="section-error">{{ section.error.value }}</InlineNotification>
    <template v-if="showBody">

      <KeyValueList
        :title="t('appInformation.appDetailsTitle')"
        :icon-src="applicationIcon"
        :rows="detailRows"
        :loading="pending"
        :empty-text="t('appInformation.noDetails')"
      />

      <KeyValueList
        :title="t('appInformation.certificateTitle')"
        :icon-src="shieldIcon"
        :rows="certificateRows"
        :loading="pending"
        :empty-text="t('appInformation.noCertificate')"
      />

      <ExpandableList
        :title="t('appInformation.componentsTitle')"
        :icon-src="sourceIcon"
        :items="componentGroups"
        :loading="pending"
        :empty-text="t('appInformation.noComponents')"
      >
        <template #title="{ item }">{{ item.label }}</template>
        <template #detail="{ item }">
          <ul class="m-0 list-none border border-subtle bg-canvas p-0">
            <li
              v-for="name in item.names"
              :key="name"
              class="flex items-center justify-between gap-2 border-t border-t-subtle px-3 py-2 first:border-t-0"
            >
              <code dir="ltr" class="min-w-0 break-all text-start font-mono text-caption text-primary">{{ name }}</code>
              <Tag v-if="name === components.mainActivity" kind="gray" size="compact">{{ t('appInformation.mainActivity') }}</Tag>
            </li>
          </ul>
        </template>
      </ExpandableList>

      <ExpandableList
        :title="t('appInformation.manifestFindingsTitle')"
        :items="manifestFindings"
        :loading="pending"
        :empty-text="t('appInformation.noManifest')"
      >
        <template #title="{ item }"><bdi dir="auto">{{ item.title }}</bdi></template>
        <template #subtitle="{ item, open }">
          <span v-if="item.description" class="max-w-[72ch]" :class="open ? 'block' : 'line-clamp-1'">
            <bdi dir="auto">{{ item.description }}</bdi>
          </span>
        </template>
        <template #summary="{ item }">
          <Tag v-if="item.severity" :kind="severityKind(item.severity)" size="compact">{{ severityLabel(item.severity, t) }}</Tag>
        </template>
        <template #detail="{ item }">
          <div v-if="item.components.length" class="flex flex-col gap-2">
            <h4 class="m-0 font-body text-label font-normal tracking-label text-helper">{{ t('appInformation.components') }}</h4>
            <ul class="m-0 list-none border border-subtle bg-canvas p-0">
              <li v-for="name in item.components" :key="name" class="border-t border-t-subtle px-3 py-2 first:border-t-0">
                <code dir="ltr" class="break-all font-mono text-caption text-primary">{{ name }}</code>
              </li>
            </ul>
          </div>
          <p v-else class="m-0 font-body text-caption text-helper">{{ t('appInformation.noComponentsForFinding') }}</p>
        </template>
      </ExpandableList>
    </template>
  </div>
</template>
