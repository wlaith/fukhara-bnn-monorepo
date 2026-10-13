<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import FileUploader from '~/components/ui/FileUploader.vue'
import Button from '~/components/ui/Button.vue'
import { analyzeApk } from '~/api/reportApi'
import { useLocalizedNavigation } from '~/composables/useLocalizedNavigation'
import applicationMobileIcon from '~/assets/icons/application--mobile.svg'
import cloudUploadIcon from '~/assets/icons/cloud--upload.svg'
import reportDataIcon from '~/assets/icons/report--data.svg'
import josaLogoMark from '~/assets/logo/josa-logo-mark-muted.svg'

definePageMeta({ name: 'home' })

const { t, locale } = useI18n()
const { push } = useLocalizedNavigation()
const uploadError = ref<string | null>(null)
const selectedFile = ref<File | null>(null)
const isAnalyzing = ref(false)

const APK_GUIDE_URL = 'https://developer.android.com/studio/run#reference'
const API_REPO = 'https://github.com/jordanopensource/fukhara-api'
const josaUrl = computed(() => (locale.value === 'ar' ? 'https://josa.ngo/ar' : 'https://josa.ngo'))

const howToSteps = [
  { key: 'getApk', icon: applicationMobileIcon, notes: false, link: APK_GUIDE_URL },
  { key: 'upload', icon: cloudUploadIcon, notes: true, link: null },
  { key: 'readReport', icon: reportDataIcon, notes: true, link: API_REPO },
] as const

function onSelect(file: File) {
  selectedFile.value = file
  uploadError.value = null
}

function onClear() {
  selectedFile.value = null
  uploadError.value = null
}

async function onAnalyze() {
  if (!selectedFile.value || isAnalyzing.value) return
  uploadError.value = null
  isAnalyzing.value = true
  try {
    const result = await analyzeApk(selectedFile.value)
    push({ name: 'analyzing', params: { id: result.id } })
  } catch (err) {
    uploadError.value = err instanceof Error ? err.message : t('homeView.uploadFailed')
  } finally {
    isAnalyzing.value = false
  }
}
</script>

<template>
  <main class="flex flex-col">
    <div class="page-shell grid grid-cols-1 border-subtle lg:grid-cols-3">
    <section class="flex flex-col gap-4 bg-layer-01 py-6 border-subtle p-6 lg:col-span-2">
      <h1 class="font-heading text-display-lg text-primary">{{ t('homeView.heroTitle') }}</h1>
      <p class="font-body text-body text-secondary">
        {{ t('homeView.heroBody') }}
      </p>
      <FileUploader label="" @select="onSelect" @clear="onClear" />
      <Button
        variant="primary"
        class="analyze-button self-start"
        :disabled="!selectedFile || isAnalyzing"
        @click="onAnalyze"
      >
        {{ isAnalyzing ? t('homeView.analyzing') : t('homeView.analyze') }}
      </Button>
      <p v-if="uploadError" class="p-4 font-body text-body text-tag-red-border">{{ uploadError }}</p>
    </section>
    <section class="flex flex-col gap-4 border-subtle p-6">
      <h2 class="font-heading text-display-sm text-primary">{{ t('homeView.builtBy.title') }}</h2>
      <i18n-t keypath="homeView.builtBy.body" tag="p" class="font-body text-body text-primary">
        <template #josa>
          <a :href="josaUrl" target="_blank" rel="noopener noreferrer" class="text-link underline">
            {{ t('homeView.builtBy.josa') }}<span class="sr-only"> {{ t('common.opensInNewTab') }}</span>
          </a>
        </template>
      </i18n-t>
      <img :src="josaLogoMark" alt="" class="mt-auto h-14 w-14 self-end">
    </section></div>
    <section class="page-shell grid grid-cols-1 border-subtle lg:grid-cols-3">
      <div v-for="step in howToSteps" :key="step.key" class="flex flex-col items-start gap-4 border-subtle p-6">
        <img :src="step.icon" alt="" width="36" height="36" class="h-9 w-9" >
        <h2 class="font-heading text-display-sm text-primary">{{ t(`homeView.howTo.${step.key}.title`) }}</h2>
        <p class="font-body text-body text-primary">{{ t(`homeView.howTo.${step.key}.body`) }}</p>
        <p v-if="step.notes" class="font-body text-body text-primary">{{ t(`homeView.howTo.${step.key}.note`) }}</p>
        <NuxtLink
          v-if="step.link"
          :to="step.link"
          external
          target="_blank"
          rel="noopener noreferrer"
          class="font-body text-body tracking-tight text-link underline"
        >
          {{ t(`homeView.howTo.${step.key}.link`) }}<span class="sr-only"> {{ t('common.opensInNewTab') }}</span>
        </NuxtLink>
      </div>
    </section>
  </main>
</template>
