<script setup lang="ts">
import Tag from '../ui/Tag.vue'
import type { SubVerdict } from '../../domain/subVerdicts'

defineProps<{ label: string; subVerdict: SubVerdict }>()
</script>

<template>
  <div class="flex flex-col gap-3 border-subtle bg-layer-01 p-5">
    <p class="font-body text-eyebrow font-semibold text-primary">{{ label }}</p>
    <p class="font-heading text-display-md font-[350] tracking-label text-primary">
      {{ subVerdict.headline }}
    </p>
    <div v-if="subVerdict.headlineKind || subVerdict.tags.length > 0" class="flex flex-wrap gap-2">
      <Tag v-if="subVerdict.headlineKind" :kind="subVerdict.headlineKind" size="compact">{{ subVerdict.headline }}</Tag>
      <Tag v-for="tag in subVerdict.tags" :key="tag.label" :kind="tag.kind" size="compact">
        {{ tag.label }}
      </Tag>
    </div>
  </div>
</template>
