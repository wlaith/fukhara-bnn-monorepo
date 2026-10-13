import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FileUploader from './FileUploader.vue'
import i18n from '~/test-utils/i18n'

function makeFile(name: string): File {
  return new File(['content'], name)
}

describe('FileUploader', () => {
  it('renders the label', () => {
    const wrapper = mount(FileUploader, { props: { label: 'Upload an APK' } })
    expect(wrapper.text()).toContain('Upload an APK')
  })

  it('shows the selected file and emits select on a valid .apk file', async () => {
    const wrapper = mount(FileUploader, { props: { label: 'Upload an APK' } })
    const input = wrapper.get('input[type="file"]')
    Object.defineProperty(input.element, 'files', { value: [makeFile('sample.apk')] })
    await input.trigger('change')
    expect(wrapper.text()).toContain('sample.apk')
    expect(wrapper.emitted('select')?.[0]?.[0]).toMatchObject({ name: 'sample.apk' })
  })

  it('shows an error and does not emit select for a non-.apk file', async () => {
    const wrapper = mount(FileUploader, { props: { label: 'Upload an APK' } })
    const input = wrapper.get('input[type="file"]')
    Object.defineProperty(input.element, 'files', { value: [makeFile('malware.exe')] })
    await input.trigger('change')
    expect(wrapper.text()).toContain('Only .apk files are supported.')
    expect(wrapper.emitted('select')).toBeUndefined()
  })

  it('removing the selected file clears it', async () => {
    const wrapper = mount(FileUploader, { props: { label: 'Upload an APK' } })
    const input = wrapper.get('input[type="file"]')
    Object.defineProperty(input.element, 'files', { value: [makeFile('sample.apk')] })
    await input.trigger('change')
    await wrapper.get('.file-uploader__remove').trigger('click')
    expect(wrapper.text()).not.toContain('sample.apk')
  })

  it('dropping a valid .apk file emits select and shows the filename', async () => {
    const wrapper = mount(FileUploader, { props: { label: 'Upload an APK' } })
    const dropzone = wrapper.get('.file-uploader__dropzone')
    await dropzone.trigger('drop', { dataTransfer: { files: [makeFile('sample.apk')] } })
    expect(wrapper.text()).toContain('sample.apk')
    expect(wrapper.emitted('select')?.[0]?.[0]).toMatchObject({ name: 'sample.apk' })
  })

  it('dropping an invalid file shows the error and does not emit select', async () => {
    const wrapper = mount(FileUploader, { props: { label: 'Upload an APK' } })
    const dropzone = wrapper.get('.file-uploader__dropzone')
    await dropzone.trigger('drop', { dataTransfer: { files: [makeFile('malware.exe')] } })
    expect(wrapper.text()).toContain('Only .apk files are supported.')
    expect(wrapper.emitted('select')).toBeUndefined()
  })

  it('toggles the dragging class on dragover and dragleave', async () => {
    const wrapper = mount(FileUploader, { props: { label: 'Upload an APK' } })
    const dropzone = wrapper.get('.file-uploader__dropzone')
    await dropzone.trigger('dragover')
    expect(dropzone.classes()).toContain('file-uploader__dropzone--dragging')
    await dropzone.trigger('dragleave')
    expect(dropzone.classes()).not.toContain('file-uploader__dropzone--dragging')
  })

  it('shows the Arabic drop prompt when the locale is ar', () => {
    i18n.global.locale.value = 'ar'
    const wrapper = mount(FileUploader, { props: { label: 'Upload an APK' } })
    expect(wrapper.text()).toContain('اسحب الملفات وأفلتها هنا أو انقر للرفع')
    i18n.global.locale.value = 'en'
  })
})
