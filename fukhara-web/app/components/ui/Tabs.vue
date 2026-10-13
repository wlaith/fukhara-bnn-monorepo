<script setup lang="ts">
const props = defineProps<{ items: { id: string; label: string }[]; activeId: string }>()
defineEmits<{ select: [id: string] }>()

function showDivider(index: number) {
  if (index === 0) return false
  const current = props.items[index]!.id
  const previous = props.items[index - 1]!.id
  return current !== props.activeId && previous !== props.activeId
}
</script>

<template>
  <div class="border-subtle flex w-full overflow-x-auto">
    <button
      v-for="(item, index) in items"
      :key="item.id"
      type="button"
      :aria-pressed="item.id === activeId"
      class="tabs__item flex-1 shrink-0 whitespace-nowrap px-4 py-3 text-start cursor-pointer font-body text-body tracking-tight transition-colors focus-visible:relative focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:-outline-offset-2"
      :class="[
        item.id === activeId
          ? 'tabs__item--active bg-layer-01 border-subtle text-primary font-semibold'
          : 'bg-transparent text-secondary hover:bg-subtle-hover/40 hover:text-primary',
        showDivider(index) ? 'border-s border-s-subtle' : '',
      ]"
      @click="$emit('select', item.id)"
    >
      {{ item.label }}
    </button>
  </div>
</template>
