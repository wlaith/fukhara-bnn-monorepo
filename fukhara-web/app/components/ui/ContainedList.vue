<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Tag from './Tag.vue'
import ListSkeleton from './ListSkeleton.vue'
import type { ContainedListRow } from './types'

defineProps<{ title: string; rows: ContainedListRow[]; loading?: boolean; emptyText?: string }>()
const { t } = useI18n()
</script>

<template>
  <div class="w-full bg-canvas">
    <div class="contained-list__header px-4 py-[15px] font-body text-body font-semibold tracking-tight text-primary bg-layer-01 border-y border-subtle">
      {{ title }}
    </div>
    <ListSkeleton v-if="loading" />
    <p v-else-if="rows.length === 0" class="p-4 font-body text-body text-secondary">
      {{ emptyText ?? t('containedList.noFindings') }}
    </p>
    <ul v-else class="m-0 list-none p-0">
      <li
        v-for="row in rows"
        :key="row.id"
        class="contained-list__row border-subtle grid grid-cols-1 items-start gap-2 px-4 py-4 font-body text-body tracking-tight text-primary sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4"
      >
        <span class="flex min-w-0 flex-col gap-2">
          <bdi
            :dir="row.mono ? 'ltr' : 'auto'"
            class="break-words text-start"
            :class="row.mono ? 'break-all font-mono text-caption' : ''"
          >{{ row.title }}</bdi>
          <span v-if="row.tags?.length" class="flex flex-wrap gap-2">
            <Tag v-for="tag in row.tags" :key="tag.label" :kind="tag.kind" size="compact" dir="auto">{{ tag.label }}</Tag>
          </span>
        </span>
        <span v-if="row.meta" class="break-all text-secondary">{{ row.meta }}</span>
      </li>
    </ul>
  </div>
</template>
