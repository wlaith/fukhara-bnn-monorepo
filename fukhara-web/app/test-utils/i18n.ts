// Test-only. App code gets a per-request i18n instance from @nuxtjs/i18n.
import { createI18n } from 'vue-i18n'
import en from '../../i18n/locales/en.json'
import ar from '../../i18n/locales/ar.json'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en, ar },
})

export default i18n
