<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const target = computed(() =>
  locale.value === 'ar' ? { code: 'en', label: 'English' } : { code: 'ar', label: 'العربية' },
)

function switchLocale() {
  navigateTo(switchLocalePath(target.value.code))
}
</script>

<template>
  <button
    type="button"
    :lang="target.code"
    class="inline-flex min-h-11 items-center justify-center border-none bg-subtle px-4 py-3 font-body text-body-lg tracking-tight text-primary cursor-pointer hover:bg-subtle-hover"
    @click="switchLocale"
  >
    {{ target.label }}
  </button>
</template>
