import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export interface FooterLinkItem {
  key: string
  label: string
  to: string
  external: boolean
}

const PRIVACY_URL = 'https://josa.ngo/info/privacypolicy#introduction-privacy'
const WEB_UI_REPO = 'https://github.com/jordanopensource/fukhara-web'
const API_REPO = 'https://github.com/jordanopensource/fukhara-api'

export function useFooterLinks() {
  const { t, locale } = useI18n()
  const localePath = useLocalePath()

  const about = computed<FooterLinkItem[]>(() => [
    { key: 'about', label: t('footer.aboutFukhara'), to: localePath({ name: 'about' }), external: false },
    {
      key: 'josa',
      label: t('footer.josaWebsite'),
      to: locale.value === 'ar' ? 'https://josa.ngo/ar' : 'https://josa.ngo',
      external: true,
    },
  ])
  const privacy = computed<FooterLinkItem>(() => ({
    key: 'privacy',
    label: t('footer.privacyPolicy'),
    to: PRIVACY_URL,
    external: false,
  }))
  const openSource = computed<FooterLinkItem[]>(() => [
    { key: 'webUi', label: t('footer.webUiSource'), to: WEB_UI_REPO, external: true },
    { key: 'api', label: t('footer.apiSource'), to: API_REPO, external: true },
  ])

  return { about, privacy, openSource }
}
