<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import LinkButton from './LinkButton.vue'
import type { AffectedFile } from '../../domain/affectedFiles'

const props = withDefaults(defineProps<{ files: AffectedFile[]; previewLimit?: number }>(), { previewLimit: 8 })
const { t } = useI18n()
const showAll = ref(false)
const visible = computed(() => (showAll.value ? props.files : props.files.slice(0, props.previewLimit)))
</script>

<template>
  <div v-if="files.length" class="affected-files flex flex-col gap-2">
    <h4 class="m-0 font-body text-label font-normal tracking-label text-helper">{{ t('affectedFiles.title') }}</h4>
    <ul class="m-0 list-none border border-subtle bg-canvas p-0">
      <li
        v-for="file in visible"
        :key="file.path"
        class="flex flex-col gap-1 border-t border-t-subtle px-3 py-2 first:border-t-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
      >
        <code dir="ltr" class="break-all text-start font-mono text-caption text-primary">{{ file.path }}</code>
        <span v-if="file.lines.length" class="shrink-0 font-body text-caption text-helper">
          {{ t('affectedFiles.lines') }} <bdi dir="ltr">{{ file.lines.join(', ') }}</bdi>
        </span>
      </li>
    </ul>
    <LinkButton v-if="files.length > previewLimit" class="affected-files__toggle" :aria-expanded="showAll" @click="showAll = !showAll">
      {{ showAll ? t('affectedFiles.showFewer') : t('affectedFiles.showAll', { count: files.length }) }}
    </LinkButton>
  </div>
</template>
