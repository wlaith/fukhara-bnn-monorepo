<script setup lang="ts">
import { computed } from 'vue'
import type { TagKind } from '../../domain/severity'

const props = withDefaults(defineProps<{ kind: TagKind; size?: 'operational' | 'compact' }>(), {
  size: 'operational',
})

const sizeClasses = computed(() =>
  props.size === 'operational' ? 'rounded-full px-3  py-[5px]' : 'rounded-full px-2 py-1 ',
)

const kindClasses = computed(() => {
  switch (props.kind) {
    case 'red':
      return 'border-tag-red-border bg-tag-red-bg/30 text-tag-red-text'
    case 'gold':
      return 'border-tag-gold-border bg-tag-gold-bg text-tag-gold-text'
    case 'green':
      return 'border-tag-green-border bg-tag-green-bg/30 text-tag-green-text'
    case 'gray':
    default:
      return 'border-tag-gray-border bg-white/5 text-tag-gray-text'
  }
})
</script>

<template>
  <span
    class="inline-flex items-center whitespace-nowrap border font-body text-label tracking-label"
    :class="[`tag--${kind}`, `tag--${size}`, sizeClasses, kindClasses]"
  >
    <slot />
  </span>
</template>
