<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import fukharaLogoEn from '~/assets/logo/fukhara-logo.svg'
import fukharaLogoAr from '~/assets/logo/fukhara-logo-ar.svg'
import josaLogoMark from '~/assets/logo/josa-logo-mark.svg'
import arrowUpRight from '~/assets/icons/arrow--up-right.svg'
import arrowUpLeft from '~/assets/icons/arrow--up-left.svg'

definePageMeta({ name: 'about' })

const { t, locale } = useI18n()
const route = useRoute()

const sectionIds = ['who', 'why'] as const
const glanceKeys = ['organization', 'basedIn', 'founded'] as const

const isArabic = computed(() => locale.value === 'ar')
const logo = computed(() => (isArabic.value ? fukharaLogoAr : fukharaLogoEn))
const josaUrl = computed(() => (isArabic.value ? 'https://josa.ngo/ar' : 'https://josa.ngo'))
const activeId = computed(() => route.hash.slice(1) || sectionIds[0])
</script>

<template>
  <main class="flex flex-col">
    <div class="page-shell">
      <section class="border-subtle p-6 md:py-8">
        <h1 class="font-heading text-display-lg text-primary">{{ t('aboutView.title') }}</h1>
      </section>
    </div>

    <div class="page-shell">
      <div class="grid grid-cols-1 lg:grid-cols-[263px_1fr]">
        <nav :aria-label="t('aboutView.onThisPage')" class="hidden flex-col gap-3 border-subtle bg-canvas py-8 lg:flex">
          <p class="px-4 font-heading text-body-lg text-secondary">{{ t('aboutView.onThisPage') }}</p>
          <ul class="flex flex-col gap-1">
            <li v-for="id in sectionIds" :key="id">
              <NuxtLink
                :to="`#${id}`"
                class="block border-b px-4 py-[15px] font-body text-body tracking-tight"
                :class="
                  id === activeId
                    ? 'border-b-[3px] border-accent bg-layer-01 text-primary'
                    : 'border-strong text-secondary'
                "
                :aria-current="id === activeId ? 'location' : undefined"
              >
                {{ t(`aboutView.sections.${id}`) }}
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <div class="flex flex-col">
          <section class="flex flex-col items-start gap-4 border-subtle bg-layer-01 p-6 md:p-8">
            <img :src="logo" alt="Fukhara" class="h-[57px] w-auto">
            <p class="max-w-[640px] font-body text-body-lg text-primary">{{ t('aboutView.intro') }}</p>
          </section>

          <section id="who" class="flex flex-col gap-4 border-subtle bg-layer-01 p-6 md:p-8">
            <h2 class="font-heading text-display-md text-primary">{{ t('aboutView.sections.who') }}</h2>
            <p class="max-w-[640px] font-body text-body-lg text-primary">{{ t('aboutView.who.body') }}</p>
            <div class="flex flex-col">
              <div class="flex items-start gap-4 border-subtle bg-panel p-4">
                <img :src="josaLogoMark" alt="" class="h-[54px] w-[55px] shrink-0">
                <div class="flex flex-col gap-1">
                  <a
                    :href="josaUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-2 font-heading text-display-sm font-semibold text-primary hover:underline"
                  >
                    {{ t('aboutView.who.orgName') }}
                    <img :src="isArabic ? arrowUpLeft : arrowUpRight" alt="" class="h-4 w-4">
                  </a>
                  <p class="font-body text-body-lg text-secondary">{{ t('aboutView.who.orgDescription') }}</p>
                </div>
              </div>
              <dl class="grid grid-cols-1 sm:grid-cols-3">
                <div v-for="key in glanceKeys" :key="key" class="flex flex-col gap-1 border-subtle p-4">
                  <dt class="font-body text-label uppercase text-secondary">
                    {{ t(`aboutView.who.glance.${key}.label`) }}
                  </dt>
                  <dd class="font-heading text-body-lg font-semibold text-primary">
                    {{ t(`aboutView.who.glance.${key}.value`) }}
                  </dd>
                </div>
              </dl>
            </div>
          </section>

          <section id="why" class="flex flex-col gap-4 border-subtle bg-layer-01 p-6 md:p-8">
            <h2 class="font-heading text-display-md text-primary">{{ t('aboutView.sections.why') }}</h2>
            <p class="max-w-[640px] font-body text-body-lg">{{ t('aboutView.why.p1') }}</p>
            <p class="max-w-[640px] font-body text-body-lg">{{ t('aboutView.why.p2') }}</p>
          </section>
        </div>
      </div>
    </div>
  </main>
</template>
