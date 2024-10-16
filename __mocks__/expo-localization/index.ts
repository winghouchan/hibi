import defaultLocale from '@/intl/defaultLocale'

const defaultCalendarMock = {
  calendar: 'gregory',
  firstWeekday: 2, // Monday
  timeZone: 'Europe/London',
  uses24hourClock: true,
}

const defaultLocaleMock = {
  currencyCode: 'GBP',
  currencySymbol: '£',
  decimalSeparator: '.',
  digitGroupingSeparator: ',',
  languageCode: 'en',
  languageTag: defaultLocale,
  measurementSystem: 'uk',
  regionCode: defaultLocale.split('-').slice(1).join('-'),
  temperatureUnit: 'celsius',
  textDirection: 'ltr',
}

export const getCalendars = jest.fn(() => [defaultCalendarMock])

export const getLocales = jest.fn(() => [defaultLocaleMock])

export const useCalendars = jest.fn(() => getCalendars())

export const useLocales = jest.fn(() => getLocales())
