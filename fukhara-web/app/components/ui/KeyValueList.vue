<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Tag from './Tag.vue'
import CopyButton from './CopyButton.vue'
import ListSkeleton from './ListSkeleton.vue'
import type { KeyValueRow } from './types'

defineProps<{ title?: string; iconSrc?: string; rows: KeyValueRow[]; loading?: boolean; emptyText?: string }>()
const { t } = useI18n()
</script>

<template>
  <div class="w-full bg-canvas">
    <div
      v-if="title"
      class="key-value-list__header flex items-center gap-2 border-y border-subtle bg-layer-01 px-4 py-[15px] font-body text-body font-semibold tracking-tight text-primary"
    >
      <img v-if="iconSrc" :src="iconSrc" :alt="title" class="h-4 w-4" >
      {{ title }}
    </div>
    <ListSkeleton v-if="loading" />
    <p v-else-if="rows.length === 0" class="p-4 font-body text-body text-secondary">
      {{ emptyText ?? t('containedList.noFindings') }}
    </p>
    <dl v-else class="m-0">
      <div
        v-for="row in rows"
        :key="row.id"
        class="key-value-list__row border-subtle grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-[minmax(8rem,14rem)_minmax(0,1fr)] sm:gap-4"
      >
        <dt class="font-body text-label tracking-label text-helper sm:pt-0.5">{{ row.label }}</dt>
        <dd class="m-0 flex min-w-0 items-start gap-2">
          <span v-if="row.tags?.length" class="flex flex-wrap gap-2">
            <Tag v-for="tag in row.tags" :key="tag.label" :kind="tag.kind" size="compact">{{ tag.label }}</Tag>
          </span>
          <a
            v-else-if="row.href"
            :href="row.href"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 font-body text-body text-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {{ row.value }}
            <svg class="h-4 w-4 fill-current rtl:-scale-x-100" viewBox="0 0 32 32" aria-hidden="true">
              <polygon points="10 6 10 8 22.59 8 6 24.59 7.41 26 24 9.41 24 22 26 22 26 6 10 6" />
            </svg>
            <span class="sr-only">{{ t('common.opensInNewTab') }}</span>
          </a>
          <span
            v-else
            :dir="row.mono ? 'ltr' : undefined"
            class="min-w-0 text-start text-primary"
            :class="row.mono ? 'break-all font-mono text-caption' : 'break-words font-body text-body'"
          ><bdi v-if="row.scanner" dir="auto">{{ row.value }}</bdi><template v-else>{{ row.value }}</template></span>
          <CopyButton v-if="row.copy && row.value" :value="row.value" :label="row.label" />
        </dd>
      </div>
    </dl>
  </div>
</template>
