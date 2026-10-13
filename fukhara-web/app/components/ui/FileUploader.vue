<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFileUpload } from '../../composables/useFileUpload'
import closeIcon from '../../assets/icons/close.svg'

defineProps<{ label: string }>()
const emit = defineEmits<{ select: [file: File]; clear: [] }>()

const { t } = useI18n()
const { selectedFile, error, selectFile, clearFile } = useFileUpload(t)
const isDragging = ref(false)

watch(selectedFile, (file) => {
  if (file) emit('select', file)
  else emit('clear')
})

function onInputChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) selectFile(file)
  input.value = ''
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) selectFile(file)
}
</script>

<template>
  <div class="flex w-full flex-col gap-4">
    <p class="font-body text-body-md font-medium text-primary">{{ label }}</p>
    <label
      class="file-uploader__dropzone block cursor-pointer border border-dashed border-strong px-4 py-5 font-body text-body text-accent"
      :class="{ 'file-uploader__dropzone--dragging border-accent bg-layer-01': isDragging }"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
    >
      <input type="file" accept=".apk" class="hidden" @change="onInputChange" >
      {{ t('fileUpload.dropPrompt') }}
    </label>
    <p v-if="error" class="font-body text-label text-tag-red-border">{{ error }}</p>
    <div v-if="selectedFile" class="flex h-12 items-center gap-4 bg-panel px-4 font-body text-body tracking-tight text-primary">
      <span class="min-w-0 flex-1 truncate">{{ selectedFile.name }}</span>
      <button
        type="button"
        :aria-label="t('fileUpload.remove', { name: selectedFile.name })"
        class="file-uploader__remove flex shrink-0 cursor-pointer items-center justify-center border-none bg-layer-01 p-0"
        @click="clearFile"
      >
        <img :src="closeIcon" alt="" width="20" height="20" >
      </button>
    </div>
  </div>
</template>
