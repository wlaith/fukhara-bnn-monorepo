<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{ value: string; label: string }>()
const { t } = useI18n()

const supported = ref(false)
const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  supported.value = window.isSecureContext && 'clipboard' in navigator
})
onBeforeUnmount(() => clearTimeout(timer))

async function copy() {
  try {
    await navigator.clipboard.writeText(props.value)
  } catch {
    return
  }
  copied.value = true
  clearTimeout(timer)
  timer = setTimeout(() => (copied.value = false), 2000)
}
</script>

<template>
  <span v-if="supported" class="inline-flex shrink-0">
    <button
      type="button"
      class="copy-button inline-flex h-6 w-6 cursor-pointer items-center justify-center bg-transparent text-secondary transition-colors duration-[110ms] hover:bg-subtle-hover/40 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
      :aria-label="t('common.copyValue', { label })"
      @click="copy"
    >
      <svg v-if="!copied" class="h-4 w-4 fill-current" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M28 10v18H10V10h18m0-2H10a2 2 0 00-2 2v18a2 2 0 002 2h18a2 2 0 002-2V10a2 2 0 00-2-2z" />
        <path d="M4 18H2V4a2 2 0 012-2h14v2H4z" />
      </svg>
      <svg v-else class="h-4 w-4 fill-tag-green-border" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M13 24L4 15l1.414-1.414L13 21.171 26.586 7.586 28 9 13 24z" />
      </svg>
    </button>
    <span class="sr-only" aria-live="polite">{{ copied ? t('common.copied') : '' }}</span>
  </span>
</template>
