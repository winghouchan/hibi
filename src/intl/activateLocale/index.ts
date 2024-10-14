import { match } from '@formatjs/intl-localematcher'
import { i18n } from '@lingui/core'
import defaultLocale from '../defaultLocale'
import messages from '../messages'
import supportedLocales, { SupportedLocale } from '../supportedLocales'
import getPluralRules from './getPluralRules'

export default function activateLocale(localePreference: string[] = []) {
  const locale = match(localePreference, supportedLocales, defaultLocale, {
    algorithm: 'lookup',
  }) as SupportedLocale
  const [language] = locale.split('-')

  getPluralRules(language)

  i18n.loadAndActivate({
    locale,
    messages: messages[locale],
  })
}
