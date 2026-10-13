<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from './Button.vue'
import LanguageToggle from './LanguageToggle.vue'
import { useLocalizedNavigation } from '../../composables/useLocalizedNavigation'
import fukharaLogoEn from '../../assets/logo/fukhara-logo.svg'
import fukharaLogoAr from '../../assets/logo/fukhara-logo-ar.svg'

defineEmits<{ analyze: [] }>()

const { t, locale } = useI18n()
const { push } = useLocalizedNavigation()
const route = useRoute()
const getRouteBaseName = useRouteBaseName()

const isArabic = computed(() => locale.value === 'ar')
const logo = computed(() => (isArabic.value ? fukharaLogoAr : fukharaLogoEn))
const isMenuOpen = ref(false)
const isHome = computed(() => getRouteBaseName(route) === 'home')

function goHome() {
  push({ name: 'home' })
}

function goAbout() {
  push({ name: 'about' })
}
</script>

<template>
  <header class="page-shell relative flex h-fit items-center justify-between bg-panel">
    <button type="button" class="border-none bg-transparent p-0 cursor-pointer" @click="goHome">
      <img :src="logo" alt="Fukhara" class="h-[27.5px] w-auto" >
    </button>

    <nav class="hidden items-center gap-2 lg:flex">
      <Button variant="secondary" @click="goAbout">{{ t('appHeader.about') }}</Button>
      <div class="flex items-stretch">
        <LanguageToggle />
        <Button v-if="!isHome" variant="primary" @click="$emit('analyze')">{{ t('appHeader.analyze') }}</Button>
      </div>
    </nav>

    <div class="flex items-center gap-2 lg:hidden">
      <div class="flex items-stretch">
        <LanguageToggle />
        <Button v-if="!isHome" variant="primary" @click="$emit('analyze')">{{ t('appHeader.analyze') }}</Button>
      </div>
      <div class="flex items-stretch">
        <LanguageToggle />
        <Button v-if="!isHome" variant="primary" @click="$emit('analyze')">{{ t('appHeader.analyze') }}</Button>
      </div>
      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center border-none bg-transparent text-primary cursor-pointer"
        :aria-label="t('appHeader.toggleMenu')"
        :aria-expanded="isMenuOpen"
        @click="isMenuOpen = !isMenuOpen"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 5H18M2 10H18M2 15H18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <div v-if="isMenuOpen" class="absolute inset-x-0 top-10 z-10 flex flex-col gap-2 bg-panel p-4 lg:hidden">
      <Button variant="secondary" @click="goAbout">{{ t('appHeader.about') }}</Button>
    </div>
  </header>
</template>
