<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{ appName?: string; packageName?: string }>()

const { t } = useI18n()
</script>

<template>
  <header class="border-subtle bg-layer-01">
    <div class="flex flex-col gap-2 p-5">
      <p class="font-body text-eyebrow font-semibold tracking-label text-secondary">{{ t('reportHeader.eyebrow') }}</p>
      <h2 v-if="appName" class="font-heading text-display-lg text-primary">{{ appName }}</h2>
      <p v-if="packageName" class="font-body text-caption tracking-tight text-secondary">{{ packageName }}</p>
    </div>
  </header>
</template>
