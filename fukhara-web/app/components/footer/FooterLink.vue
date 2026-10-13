<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { FooterLinkItem } from '../../composables/useFooterLinks'

defineProps<{ link: FooterLinkItem }>()

const { t } = useI18n()
</script>

<template>
  <div class="flex min-h-11 w-full items-center lg:min-h-8">
    <NuxtLink
      :to="link.to"
      :external="link.external"
      :target="link.external ? '_blank' : undefined"
      :rel="link.external ? 'noopener noreferrer' : undefined"
      class="font-body text-body tracking-tight text-link underline"
    >
      {{ link.label }}<span v-if="link.external" class="sr-only"> {{ t('footer.newTab') }}</span>
    </NuxtLink>
  </div>
</template>
