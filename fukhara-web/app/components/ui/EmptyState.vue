<script setup lang="ts">
defineProps<{ title: string; description: string }>()
</script>

<template>
  <div class="flex flex-col gap-2 p-6 text-center">
    <p class="font-body text-body font-semibold text-primary">{{ title }}</p>
    <p class="font-body text-body text-secondary">{{ description }}</p>
  </div>
</template>
