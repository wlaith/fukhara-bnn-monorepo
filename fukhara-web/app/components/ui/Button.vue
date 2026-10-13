<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'primary' | 'secondary' }>(), { variant: 'secondary' })
defineEmits<{ click: [event: MouseEvent] }>()
</script>

<template>
  <button
    class="inline-flex min-h-11 items-center justify-center border-none py-3 font-body text-body-lg tracking-tight cursor-pointer disabled:cursor-not-allowed"
    :class="[
      `button--${variant}`,
      variant === 'primary'
        ? 'bg-accent text-accent-text-on ps-4 pe-16 disabled:bg-button-disabled disabled:text-on-color-disabled'
        : 'bg-transparent text-accent px-4',
    ]"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>
