<script setup lang="ts">
import AppFooter from './components/footer/AppFooter.vue'
import AppHeader from './components/ui/AppHeader.vue'
import { useLocalizedNavigation } from './composables/useLocalizedNavigation'

const { locale, localeProperties } = useI18n()
const { push } = useLocalizedNavigation()

useHead(() => ({
  htmlAttrs: { lang: locale.value, dir: localeProperties.value.dir },
}))
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <AppHeader @analyze="push({ name: 'home' })" />
    <div class="flex flex-1 flex-col">
      <NuxtPage />
    </div>
    <AppFooter />
  </div>
</template>
