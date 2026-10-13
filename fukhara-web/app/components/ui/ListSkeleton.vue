<script setup lang="ts">
import { useI18n } from 'vue-i18n'

withDefaults(defineProps<{ rows?: number }>(), { rows: 3 })
const { t } = useI18n()
</script>

<template>
  <div class="list-skeleton" role="status" aria-busy="true">
    <span class="sr-only">{{ t('common.loading') }}</span>
    <div v-for="n in rows" :key="n" class="border-subtle flex flex-col gap-2 px-4 py-4" aria-hidden="true">
      <span class="block h-3.5 w-2/5 animate-pulse bg-panel motion-reduce:animate-none" />
      <span class="block h-3 w-3/5 animate-pulse bg-panel motion-reduce:animate-none" />
    </div>
  </div>
</template>
