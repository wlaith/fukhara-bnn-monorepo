<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ProgressBar from '~/components/ui/ProgressBar.vue'
import { apiConfig } from '~/api/config'
import { getAnalysisStatus } from '~/api/reportApi'
import { useAnalysisProgress } from '~/composables/useAnalysisProgress'
import { useLocalizedNavigation } from '~/composables/useLocalizedNavigation'

definePageMeta({ name: 'analyzing' })

const { t } = useI18n()
const route = useRoute()
const { push } = useLocalizedNavigation()

const id = route.params.id as string

const { stepLabel, percent, error, start, stop } = useAnalysisProgress(
  () => {
    push({ name: 'report', params: { id } })
  },
  t,
  apiConfig().useMock ? undefined : () => getAnalysisStatus(id),
)

onMounted(start)
onBeforeUnmount(stop)
</script>

<template>
  <main class="page-shell flex  flex-col gap-4 border-subtle w-full">
    <div class="border-subtle p-6">
    <h1 class="font-heading text-display-lg text-primary">{{ t('analyzingView.title') }}</h1>
    <p class="font-body text-body text-secondary">{{ t('analyzingView.subtitle') }}</p>
    <ProgressBar
      :percent="percent"
      :label="stepLabel"
      :helper-text="t('analyzingView.helperText')"
    />
    <p v-if="error" role="alert" class="pt-4 font-body text-body text-tag-red-border">{{ error }}</p>
    </div>
  </main>
</template>
