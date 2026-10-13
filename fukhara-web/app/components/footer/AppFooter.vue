<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import FooterLink from './FooterLink.vue'
import FooterSection from './FooterSection.vue'
import { useFooterLinks } from '../../composables/useFooterLinks'
import fukharaLogoEn from '../../assets/logo/fukhara-logo.svg'
import fukharaLogoAr from '../../assets/logo/fukhara-logo-ar.svg'
import footerArtwork from '../../assets/illustrations/footer-artwork.svg'

const { t, locale } = useI18n()
const { about, privacy, openSource } = useFooterLinks()

const logo = computed(() => (locale.value === 'ar' ? fukharaLogoAr : fukharaLogoEn))

// extends the artwork's layer-01 shelf (starts at 422/491) past the image edges
const artworkStyle = {
  background: `url(${footerArtwork}) center bottom / auto 100% no-repeat, linear-gradient(to bottom, transparent 85.947%, #22282A 85.947%)`,
}
</script>

<template>
  <footer :aria-label="t('footer.ariaLabel')" class="mt-8">
    <div aria-hidden="true" class="aspect-[2720/491] max-h-[491px] min-h-[200px] w-full" :style="artworkStyle" />
    <div class="page-shell grid grid-cols-1 border-subtle bg-layer-01 lg:grid-cols-3">
      <FooterSection>
        <img :src="logo" alt="Fukhara" class="h-[40px] w-auto self-start" >
        <p class="font-body text-body text-secondary">{{ t('footer.tagline') }}</p>
        <p class="font-body text-body text-secondary">{{ t('footer.builtBy') }}</p>
        <FooterLink v-for="item in about" :key="item.key" :link="item" />
      </FooterSection>

      <FooterSection :title="t('footer.dataTitle')">
        <p class="font-body text-body text-secondary">{{ t('footer.dataBody') }}</p>
        <FooterLink :link="privacy" />
      </FooterSection>

      <FooterSection :title="t('footer.openSourceTitle')">
        <p class="font-body text-body text-secondary">{{ t('footer.openSourceBody') }}</p>
        <FooterLink v-for="item in openSource" :key="item.key" :link="item" />
      </FooterSection>
    </div>
  </footer>
</template>
