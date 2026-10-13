<script setup lang="ts">
defineProps<{ iconSrc: string; iconAlt: string; label: string }>()
</script>

<template>
  <div class="flex flex-col gap-2 py-4">
    <div class="flex items-center gap-1">
      <img :src="iconSrc" :alt="iconAlt" class="h-[18px] w-[18px]" >
      <span class="font-body text-eyebrow font-semibold text-primary">{{ label }}</span>
    </div>
    <div class="font-body text-body text-primary">
      <slot />
    </div>
  </div>
</template>
