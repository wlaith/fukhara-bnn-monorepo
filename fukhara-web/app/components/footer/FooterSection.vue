<script setup lang="ts">
defineProps<{ title?: string }>()
</script>

<template>
  <section class="flex flex-col gap-3 border-subtle px-6 py-8">
    <h2 v-if="title" class="font-heading text-display-sm text-primary">{{ title }}</h2>
    <slot />
  </section>
</template>
