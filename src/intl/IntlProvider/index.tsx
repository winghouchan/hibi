/**
 * Importing from `@formatjs/<intl-api>/polyfill` runs a check to see if the
 * respective `Intl` APIs require polyfilling. This check can have a significant
 * cost on app startup time (see https://github.com/formatjs/formatjs/issues/4463).
 * As missing `Intl` APIs are known in the Hermes JavaScript engine, polyfills are
 * imported from `@formatjs/<intl-api>/polyfill-force` to bypass the check. See
 * https://github.com/facebook/hermes/blob/add4115869df5b78914fab0ca15d71ab958e8588/doc/IntlAPIs.md
 * for `Intl` API support in Hermes.
 */
import '@formatjs/intl-locale/polyfill-force'
import '@formatjs/intl-pluralrules/polyfill-force'
import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { useLocales } from 'expo-localization'
import { PropsWithChildren, useEffect } from 'react'
import activateLocale from '../activateLocale'
import DefaultComponent from './DefaultComponent'

activateLocale()

export default function IntlProvider({ children }: PropsWithChildren) {
  const locales = useLocales()

  useEffect(() => {
    activateLocale(locales.map(({ languageTag }) => languageTag))
  }, [locales])

  return (
    <I18nProvider i18n={i18n} defaultComponent={DefaultComponent}>
      {children}
    </I18nProvider>
  )
}
