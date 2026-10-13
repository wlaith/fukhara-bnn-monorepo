<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import EmptyState from '../../ui/EmptyState.vue'

const { t } = useI18n()
</script>

<template>
  <EmptyState :title="t('controlFlow.title')" :description="t('controlFlow.description')" />
</template>
