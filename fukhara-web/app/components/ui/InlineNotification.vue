<script setup lang="ts">
withDefaults(defineProps<{ kind?: 'error' | 'info' }>(), { kind: 'error' })
</script>

<template>
  <div
    :role="kind === 'error' ? 'alert' : 'status'"
    class="inline-notification flex items-start gap-3 border-s-[3px] bg-layer-01 px-4 py-3 font-body text-body text-primary"
    :class="kind === 'error' ? 'border-s-tag-red-border' : 'border-s-strong'"
  >
    <svg v-if="kind === 'error'" class="mt-0.5 h-4 w-4 shrink-0 fill-tag-red-border" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 1C4.1 1 1 4.1 1 8s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zm2.7 10.5L8 8.8l-2.7 2.7-.8-.8L7.2 8 4.5 5.3l.8-.8L8 7.2l2.7-2.7.8.8L8.8 8l2.7 2.7-.8.8z" />
    </svg>
    <svg v-else class="mt-0.5 h-4 w-4 shrink-0 fill-secondary" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm.5 11h-1V7h1v5zM8 5.75A.75.75 0 118 4.25a.75.75 0 010 1.5z" />
    </svg>
    <span class="min-w-0 break-words"><slot /></span>
  </div>
</template>
