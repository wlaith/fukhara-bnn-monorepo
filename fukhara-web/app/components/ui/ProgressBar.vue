<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ percent: number; label: string; helperText: string }>()

const clampedPercent = computed(() => Math.min(100, Math.max(0, props.percent)))
</script>

<template>
  <div class="flex w-full flex-col gap-2">
    <p class="font-body text-body tracking-tight text-primary">{{ label }}</p>
    <div class="h-2 w-full bg-subtle">
      <div class="progress-bar__fill h-full bg-accent" :style="{ width: `${clampedPercent}%` }" />
    </div>
    <p class="font-body text-label tracking-label text-helper">{{ helperText }}</p>
  </div>
</template>
