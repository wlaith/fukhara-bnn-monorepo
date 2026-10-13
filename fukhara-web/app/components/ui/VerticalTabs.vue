<script setup lang="ts">
defineProps<{ items: { id: string; label: string }[]; activeId: string }>()
defineEmits<{ select: [id: string] }>()
</script>

<template>
  <nav class="flex w-full flex-row overflow-x-auto bg-panel lg:w-[164px] lg:flex-col lg:overflow-visible">
    <button
      v-for="item in items"
      :key="item.id"
      type="button"
      class="vertical-tabs__item h-16 shrink-0 whitespace-nowrap border-b-[3px] border-e border-subtle bg-transparent px-4 text-start font-body text-body tracking-tight text-secondary cursor-pointer lg:border-b lg:border-e-0 lg:border-s-[3px]"
      :class="{
        'vertical-tabs__item--active border-b-accent text-primary font-semibold lg:border-b-subtle lg:border-s-accent': item.id === activeId,
      }"
      @click="$emit('select', item.id)"
    >
      {{ item.label }}
    </button>
  </nav>
</template>
