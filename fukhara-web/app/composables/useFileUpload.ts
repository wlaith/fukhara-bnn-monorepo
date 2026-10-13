import { ref } from 'vue'
import type { Translate } from '~/domain/translate'

export function useFileUpload(t: Translate) {
  const selectedFile = ref<File | null>(null)
  const error = ref<string | null>(null)

  function selectFile(file: File) {
    if (!file.name.toLowerCase().endsWith('.apk')) {
      selectedFile.value = null
       error.value = t('fileUpload.invalidType')
      return
    }
    selectedFile.value = file
    error.value = null
  }

  function clearFile() {
    selectedFile.value = null
    error.value = null
  }

  return { selectedFile, error, selectFile, clearFile }
}
