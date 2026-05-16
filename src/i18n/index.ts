import { createI18n } from 'vue-i18n'
import { STORAGE_KEY } from '@/config/i18n'

const locales = import.meta.glob('./locales/*.js', {
  eager: true,
  import: 'default'
})

const messages: Record<string, any> = {}

const commonKey: Record<string, string[]> = {
  'zh-Hant': ['zh-HK', 'zh-TW', 'zh-MO']
}

for (const [key, value] of Object.entries(locales)) {
  messages[key.replace(/(.*\/)*([^.]+).*/gi, '$2')] = value
}

const availableLocales = Object.keys(messages)
const fallbackLocale = 'zh'

const getDefaultLanguage = () => {
  const savedLang = localStorage.getItem(STORAGE_KEY)

  if (savedLang) {
    return savedLang
  }

  const browserLang = navigator.language.toLowerCase()
  const availableLang = availableLocales.find(
    key => key.toLowerCase() === browserLang
  )

  if (availableLang) {
    return availableLang
  }

  for (const [key, val] of Object.entries(commonKey)) {
    if (val.some(item => item.toLowerCase() === browserLang)) {
      return key
    }
  }

  return fallbackLocale
}

const i18n = createI18n({
  legacy: false,
  locale: getDefaultLanguage(),
  fallbackLocale,
  messages,
  availableLocales
})

export default i18n
