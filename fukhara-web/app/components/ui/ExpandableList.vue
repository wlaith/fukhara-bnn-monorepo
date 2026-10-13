<script setup lang="ts" generic="T extends { id: string }">
import { ref, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import ListSkeleton from './ListSkeleton.vue'

defineProps<{ title?: string; iconSrc?: string; items: T[]; loading?: boolean; emptyText?: string }>()
defineSlots<{
  title(props: { item: T }): unknown
  subtitle?(props: { item: T; open: boolean }): unknown
  summary?(props: { item: T }): unknown
  detail(props: { item: T }): unknown
}>()

const { t } = useI18n()
const baseId = useId()
const openIds = ref(new Set<string>())
const renderedIds = ref(new Set<string>())

function toggle(id: string) {
  const next = new Set(openIds.value)
  if (!next.delete(id)) next.add(id)
  openIds.value = next
  if (next.has(id) && !renderedIds.value.has(id)) renderedIds.value = new Set(renderedIds.value).add(id)
}

const isOpen = (id: string) => openIds.value.has(id)
const panelId = (index: number) => `${baseId}-panel-${index}`
const headingId = (index: number) => `${baseId}-heading-${index}`
</script>

<template>
  <div class="w-full bg-canvas">
    <div
      v-if="title"
      class="expandable-list__header flex items-center gap-2 px-4 py-[15px] font-body text-body font-semibold tracking-tight text-primary bg-layer-01 border-y border-subtle"
    >
      <img v-if="iconSrc" :src="iconSrc" :alt="title" class="h-4 w-4" >
      {{ title }}
    </div>
    <ListSkeleton v-if="loading" />
    <p v-else-if="items.length === 0" class="p-4 font-body text-body text-secondary">
      {{ emptyText ?? t('containedList.noFindings') }}
    </p>
    <ul v-else class="m-0 list-none p-0">
      <li
        v-for="(item, index) in items"
        :key="item.id"
        class="expandable-list__item border-subtle transition-colors duration-[110ms]"
        :class="isOpen(item.id) ? 'expandable-list__item--open bg-layer-01' : ''"
      >
        <button
          :id="headingId(index)"
          type="button"
          class="expandable-list__toggle flex w-full cursor-pointer items-start gap-4 bg-transparent px-4 py-4 text-start font-body text-body tracking-tight text-primary transition-colors duration-[110ms] hover:bg-subtle-hover/40 focus-visible:relative focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
          :aria-expanded="isOpen(item.id)"
          :aria-controls="panelId(index)"
          @click="toggle(item.id)"
        >
          <span class="flex min-w-0 flex-1 flex-col gap-2">
            <span class="break-words font-semibold">
              <slot name="title" :item="item" />
            </span>
            <span v-if="$slots.subtitle" class="expandable-list__subtitle -mt-1 font-body text-caption font-normal text-secondary">
              <slot name="subtitle" :item="item" :open="isOpen(item.id)" />
            </span>
            <span v-if="$slots.summary" class="flex flex-wrap items-center gap-2">
              <slot name="summary" :item="item" />
            </span>
          </span>
          <svg
            class="mt-0.5 h-4 w-4 shrink-0 fill-current text-secondary transition-transform duration-[110ms] ease-[cubic-bezier(0.2,0,0.38,0.9)] motion-reduce:transition-none"
            :class="isOpen(item.id) ? 'rotate-180' : ''"
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <path d="M8 11L3 6 3.7 5.3 8 9.6 12.3 5.3 13 6z" />
          </svg>
        </button>
        <div
          v-show="isOpen(item.id)"
          :id="panelId(index)"
          role="region"
          :aria-labelledby="headingId(index)"
          class="expandable-list__panel px-4 pb-6 pt-2"
        >
          <slot v-if="renderedIds.has(item.id)" name="detail" :item="item" />
        </div>
      </li>
    </ul>
  </div>
</template>
