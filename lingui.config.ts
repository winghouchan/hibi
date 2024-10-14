import { LinguiConfig } from '@lingui/conf'
import defaultLocale from './src/intl/defaultLocale'

export default {
  locales: [defaultLocale, 'en-XA'],
  sourceLocale: defaultLocale,
  pseudoLocale: 'en-XA',
  fallbackLocales: {
    default: defaultLocale,
  },
  catalogs: [
    {
      path: '<rootDir>/src/intl/messages/{locale}',
      include: ['<rootDir>/src/**'],
      exclude: ['**/node_modules/**', '<rootDir>/src/intl/**'],
    },
  ],
  format: 'po',
} satisfies LinguiConfig
