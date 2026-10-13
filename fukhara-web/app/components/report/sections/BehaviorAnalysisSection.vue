<script setup lang="ts">
import { computed, inject, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Tabs from '../../ui/Tabs.vue'
import Tag from '../../ui/Tag.vue'
import ContainedList from '../../ui/ContainedList.vue'
import ExpandableList from '../../ui/ExpandableList.vue'
import AffectedFilesList from '../../ui/AffectedFilesList.vue'
import InlineNotification from '../../ui/InlineNotification.vue'
import LinkButton from '../../ui/LinkButton.vue'
import { REPORT_INJECTION_KEY, isPending } from '../../../composables/useReport'
import { permissionStatusKind, permissionStatusLabel, severityKind, severityLabel } from '../../../domain/severity'
import { confidenceKind, toApiUsages, toBehaviours, toPermissions } from '../../../domain/behavior'
import { capitalize } from '../../../domain/subVerdicts'

const { t } = useI18n()
const report = inject(REPORT_INJECTION_KEY)!
const section = report.behaviorAnalysis

onMounted(() => {
  section.load()
})

const pending = computed(() => isPending(section))
const showBody = computed(() => pending.value || section.data.value !== null)
const permissions = computed(() => toPermissions(section.data.value?.permissions))
const behaviours = computed(() => toBehaviours(section.data.value?.threats))
const apiUsages = computed(() => toApiUsages(section.data.value?.detailed_permissions))

const VIEWS = ['permissions', 'behaviours', 'api-usage'] as const
type View = (typeof VIEWS)[number]
const activeView = ref<View>('permissions')

const viewTabs = computed(() => [
  { id: 'permissions', label: t('behaviorAnalysis.permissionsTab', { count: permissions.value.length }) },
  { id: 'behaviours', label: t('behaviorAnalysis.behavioursTab', { count: behaviours.value.length }) },
  { id: 'api-usage', label: t('behaviorAnalysis.apiUsageTab', { count: apiUsages.value.length }) },
])

function onSelectView(id: string) {
  const view = VIEWS.find((v) => v === id)
  if (view) activeView.value = view
}

const PAGE_SIZE = 25
const behaviourLimit = ref(PAGE_SIZE)
const behaviourRows = computed(() =>
  behaviours.value.slice(0, behaviourLimit.value).map((behaviour) => ({
    id: behaviour.id,
    title: behaviour.crime,
    tags:
      behaviour.confidence === null
        ? []
        : [{ label: t('behaviorAnalysis.confidence', { value: behaviour.confidence }), kind: confidenceKind(behaviour.confidence) }],
  })),
)
const nextPage = computed(() => Math.min(PAGE_SIZE, behaviours.value.length - behaviourLimit.value))
</script>

<template>
  <div>
    <InlineNotification v-if="section.error.value" class="section-error">{{ section.error.value }}</InlineNotification>
    <template v-if="showBody">
      <Tabs :items="viewTabs" :active-id="activeView" @select="onSelectView" />

      <ExpandableList
        v-if="activeView === 'permissions'"
        :title="t('behaviorAnalysis.permissionsTitle')"
        :items="permissions"
        :loading="pending"
        :empty-text="t('behaviorAnalysis.noPermissions')"
      >
        <template #title="{ item }"><bdi dir="auto">{{ item.summary ? capitalize(item.summary) : item.name }}</bdi></template>
        <template #subtitle="{ item }">
          <code v-if="item.summary" dir="ltr" class="break-all font-mono text-caption">{{ item.name }}</code>
        </template>
        <template #summary="{ item }">
          <Tag :kind="permissionStatusKind(item.status)" size="compact">
            {{ permissionStatusLabel(item.rawStatus ?? item.status, t) }}
          </Tag>
        </template>
        <template #detail="{ item }">
          <p class="m-0 max-w-[72ch] font-body text-body leading-relaxed text-secondary">
            <bdi dir="auto">{{ item.description ?? t('behaviorAnalysis.noDescription') }}</bdi>
          </p>
        </template>
      </ExpandableList>

      <template v-else-if="activeView === 'behaviours'">
        <ContainedList
          :title="t('behaviorAnalysis.behavioursTitle')"
          :rows="behaviourRows"
          :loading="pending"
          :empty-text="t('behaviorAnalysis.noBehaviours')"
        />
        <div v-if="nextPage > 0" class="border-subtle px-4 py-3">
          <LinkButton @click="behaviourLimit += PAGE_SIZE">{{ t('common.showMore', { count: nextPage }) }}</LinkButton>
        </div>
      </template>

      <ExpandableList
        v-else
        :title="t('behaviorAnalysis.apiUsageTitle')"
        :items="apiUsages"
        :loading="pending"
        :empty-text="t('behaviorAnalysis.noApiUsage')"
      >
        <template #title="{ item }"><bdi dir="auto">{{ item.title }}</bdi></template>
        <template #summary="{ item }">
          <Tag v-if="item.severity" :kind="severityKind(item.severity)" size="compact">{{ severityLabel(item.severity, t) }}</Tag>
          <span v-if="item.files.length" class="font-body text-caption text-helper">
            {{ t('codeAnalysis.filesCount', { count: item.files.length }) }}
          </span>
        </template>
        <template #detail="{ item }"><AffectedFilesList :files="item.files" /></template>
      </ExpandableList>
    </template>
  </div>
</template>
