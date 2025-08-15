import { jest } from '@jest/globals'
import { AllMessages } from '@lingui/core'
import { act, render, screen } from '@testing-library/react-native'
import { EventEmitter } from 'expo'
import { type Locale } from 'expo-localization'

/**
 * Mock of the key for the localized message
 */
const messageKeyMock = 'message'

/**
 * Mock of the default locale language tag
 *
 * It is an IETF BCP 47 compliant language tag with a private-use subtag to
 * communicate the intention that it represents a default locale in tests. Use
 * this to signify a locale preference for the default locale and as the key for
 * messages for the default locale.
 */
const defaultLocaleLanguageTagMock = 'en-x-default'

function mockLocalizedMessages(mock: Partial<AllMessages>) {
  jest.doMock('@/intl/messages', () => ({
    __esModule: true,
    default: mock,
  }))
}

/**
 * Creates a locale mock with mocked locale data and messages.
 *
 * It accepts an IETF BCP 47 compliant language tag to represent the locale to
 * be mocked. The locale data is just the data for `en-GB` – it is not significant
 * for the test. The region code is naively derived from all the subtags after the
 * primary language subtag – for the purposes for testing this is sufficient.
 * The mocked message is just language tag – there is no significance other than
 * needing to be unique from other locale mocks.
 */
function createLocaleMock<LanguageTag extends string>(
  languageTag: LanguageTag,
) {
  const localeDataMock = {
    currencyCode: 'GBP',
    currencySymbol: '£',
    decimalSeparator: '.',
    digitGroupingSeparator: ',',
    languageScriptCode: 'Latn',
    measurementSystem: 'uk',
    temperatureUnit: 'celsius',
    textDirection: 'ltr',
  } as const
  const languageCode = languageTag.split(
    '-',
  )[0] as LanguageTag extends `${infer LanguageCode}-${string}`
    ? LanguageCode
    : never
  const maybeRegionCode = languageTag.split('-').slice(1).join('-')
  const regionCode = (
    maybeRegionCode !== '' ? maybeRegionCode : null
  ) as LanguageTag extends `${string}-${infer RegionCode}` ? RegionCode : null

  return {
    data: {
      ...localeDataMock,
      languageRegionCode: regionCode,
      languageCurrencyCode: localeDataMock.currencyCode,
      languageCurrencySymbol: localeDataMock.currencySymbol,
      languageTag,
      languageCode,
      regionCode,
    } satisfies Locale,
    messages: {
      [messageKeyMock]: languageTag,
    },
  }
}

/**
 * Locale data and messages that represents the default locale.
 */
const defaultLocaleMock = createLocaleMock(defaultLocaleLanguageTagMock)

/**
 * Locale data and messages that represents the locale that should be expected
 * in a test case.
 */
const expectedLocaleMock = createLocaleMock('en-x-expected')

/**
 * Locale data and messages that represents a locale that should not be expected
 * in a test case. The subtag `unexpctd` is spelt so as subtags have an 8
 * character limit.
 */
const unexpectedLocaleMock = createLocaleMock('en-x-unexpctd')

/**
 * Locale data and messages that represents a locale that is supported (but
 * should not be expected) in a test case. The subtag `spprtd` is spelt so as
 * subtags have an 8 character limit.
 */
const supportedLocaleMock = createLocaleMock('en-x-spprtd')

/**
 * Locale data and messages that represents a locale that is not supported in a
 * test case. The subtag `unspprtd` is spelt so as subtags have an 8 character
 * limit.
 */
const unsupportedLocaleMock = createLocaleMock('en-x-unspprtd')

describe('<IntlProvider />', () => {
  /**
   * Mocks the user's locale preference.
   *
   * It works by holding a reference to the `mockReturnValue` method of a mock
   * of the `getLocales` function from Expo Localization. `getLocales` returns
   * the user's locale preferences. The reference is set in the `beforeEach` test
   * lifecycle hook. `getLocales` is mocked by Expo's Jest preset which, by
   * default, does not define an implementation or return value (it's just the
   * result of calling `jest.fn`).
   *
   * @see {@link https://github.com/expo/expo/tree/main/packages/jest-expo | Source of Expo's Jest preset}
   * @see {@link https://github.com/expo/expo/blob/3a26c8486e2dee579ee193b9d204c3c8511161de/packages/jest-expo/src/preset/setup.js#L109-L118 | Source of mock definition}
   */
  let mockLocalePreference: jest.Mocked<
    (typeof import('expo-localization'))['getLocales']
  >['mockReturnValue']

  /**
   * Mocked event emitter
   *
   * When the locale preferences change, an `onLocalesSettingsChanged` event will
   * be emitted by Expo Localization. Mocking the event emitter allows for the
   * mocking of this event.
   *
   * @see {@link https://github.com/expo/expo/tree/main/packages/jest-expo | Source of Expo's Jest preset}
   * @see {@link https://github.com/expo/expo/blob/a6e478e0b5383561aded9c7596ddbe7cd530fd03/packages/jest-expo/src/preset/setup.js#L247-L248 | Source of mock definition}
   */
  let eventEmitterMock: InstanceType<typeof EventEmitter>

  beforeEach(async () => {
    /**
     * This test suite defines its own mocks of Expo Localization APIs
     */
    jest.unmock('expo-localization')

    eventEmitterMock = new EventEmitter()

    /**
     * Work around React error saying:
     *
     * > Warning: Invalid hook call. Hooks can only be called inside of the body of a function component.
     * > This could happen for one of the following reasons:
     * >
     * > 1. You might have mismatching versions of React and the renderer (such as React DOM)
     * > 2. You might be breaking the Rules of Hooks
     * > 3. You might have more than one copy of React in the same app
     *
     * The cause of this error is `jest.isolateModulesAsync` creating a sandbox
     * module registry in each test. A sandbox module registry is required because
     * each test is provided a fixture with localized messages (see definition and
     * calls to `mockLocalizedMessages` function). `jest.isolateModulesAsync` ensures
     * each test has the mocked values defined for that test, as opposed to reading
     * the module registry cache which contains the values from the first time the
     * module was mocked. A side effect of this is two copies of React existing –
     * one from this test file (as JSX is written) and the other from `IntlProvider`
     * (as `IntlProvider` is imported within the sandbox module registry).
     *
     * The following mock works around this by forcing Jest to look at a _mock_
     * of React (which actually returns the real implementation) when resolving
     * imports to React.
     */
    jest.doMock('react', () => jest.requireActual('react'))

    jest.doMock('@/intl/defaultLocale', () => ({
      __esModule: true,
      default: defaultLocaleLanguageTagMock,
    }))

    jest.doMock('expo-localization/build/ExpoLocalization.native', () => ({
      __esModule: true,

      ...jest.requireActual<
        typeof import('expo-localization/build/ExpoLocalization')
      >('expo-localization/build/ExpoLocalization'),

      addLocaleListener(listener: () => void) {
        return eventEmitterMock.addListener('onLocaleSettingsChanged', listener)
      },

      removeSubscription(subscription: { remove: () => void }) {
        return subscription.remove()
      },
    }))

    const { getLocales } = (await import(
      'expo-localization'
    )) as unknown as jest.Mocked<typeof import('expo-localization')>

    mockLocalePreference = getLocales.mockReturnValue

    /**
     * Set the initial return of `getLocales` to return the correct type instead
     * of `undefined`.
     */
    mockLocalePreference([])
  })

  test.each([
    {
      name: 'on initial render, uses the default locale',
      fixture: {
        messages: {
          [unexpectedLocaleMock.data.languageTag]:
            unexpectedLocaleMock.messages,
          [defaultLocaleMock.data.languageTag]: defaultLocaleMock.messages,
        },
      },
      expected: defaultLocaleMock.messages[messageKeyMock],
    },
    {
      name: 'when a single locale preference is returned and the locale preference is supported, uses the preferred locale',
      fixture: {
        messages: {
          [expectedLocaleMock.data.languageTag]: expectedLocaleMock.messages,
          [defaultLocaleMock.data.languageTag]: defaultLocaleMock.messages,
        },
        preference: [expectedLocaleMock.data],
      },
      expected: expectedLocaleMock.messages[messageKeyMock],
    },
    {
      name: 'when a single locale preference is returned and the locale preference is not supported, uses the default locale',
      fixture: {
        messages: {
          [defaultLocaleMock.data.languageTag]: defaultLocaleMock.messages,
        },
        preference: [unsupportedLocaleMock.data],
      },
      expected: defaultLocaleMock.messages[messageKeyMock],
    },
    {
      name: 'when multiple locale preferences are returned and the supported locale is the first in the list of locale preferences, uses the preferred locale',
      fixture: {
        messages: {
          [expectedLocaleMock.data.languageTag]: expectedLocaleMock.messages,
          [defaultLocaleMock.data.languageTag]: defaultLocaleMock.messages,
        },
        preference: [expectedLocaleMock.data, unsupportedLocaleMock.data],
      },
      expected: expectedLocaleMock.messages[messageKeyMock],
    },
    {
      name: 'when multiple locale preferences are returned and the supported locale is not the first in the list of locale preferences, uses the first supported preferred locale',
      fixture: {
        messages: {
          [expectedLocaleMock.data.languageTag]: expectedLocaleMock.messages,
          [defaultLocaleMock.data.languageTag]: defaultLocaleMock.messages,
        },
        preference: [unsupportedLocaleMock.data, expectedLocaleMock.data],
      },
      expected: expectedLocaleMock.messages[messageKeyMock],
    },
    {
      name: 'when multiple locale preferences are returned and there are multiple supported locales, uses the first supported preferred locale',
      fixture: {
        messages: {
          [expectedLocaleMock.data.languageTag]: expectedLocaleMock.messages,
          [supportedLocaleMock.data.languageTag]: supportedLocaleMock.messages,
          [defaultLocaleMock.data.languageTag]: defaultLocaleMock.messages,
        },
        preference: [expectedLocaleMock.data, supportedLocaleMock.data],
      },
      expected: expectedLocaleMock.messages[messageKeyMock],
    },
    {
      name: 'when multiple locale preferences are returned and no locale preferences are supported, uses the default locale',
      fixture: {
        messages: {
          [defaultLocaleMock.data.languageTag]: defaultLocaleMock.messages,
        },
        preference: [unsupportedLocaleMock.data, unsupportedLocaleMock.data],
      },
      expected: defaultLocaleMock.messages[messageKeyMock],
    },
  ])('$name', async ({ fixture, expected }) => {
    await jest.isolateModulesAsync(async () => {
      mockLocalizedMessages(fixture.messages)

      fixture.preference && mockLocalePreference(fixture.preference)

      const { Trans } = await import('@lingui/react')
      const { default: IntlProvider } = await import('./IntlProvider')

      render(
        <IntlProvider>
          <Trans id={messageKeyMock} />
        </IntlProvider>,
      )

      expect(screen.getByText(expected)).toBeOnTheScreen()
    })
  })

  test('when the locale changes, uses the new locale', async () => {
    await jest.isolateModulesAsync(async () => {
      mockLocalizedMessages({
        [supportedLocaleMock.data.languageTag]: supportedLocaleMock.messages,
        [expectedLocaleMock.data.languageTag]: expectedLocaleMock.messages,
        [defaultLocaleMock.data.languageTag]: defaultLocaleMock.messages,
      })

      const { Trans } = await import('@lingui/react')
      const { default: IntlProvider } = await import('./IntlProvider')

      mockLocalePreference([supportedLocaleMock.data])

      render(
        <IntlProvider>
          <Trans id={messageKeyMock} />
        </IntlProvider>,
      )

      mockLocalePreference([expectedLocaleMock.data])

      act(() => {
        eventEmitterMock.emit('onLocaleSettingsChanged')
      })

      expect(
        screen.getByText(expectedLocaleMock.messages[messageKeyMock]),
      ).toBeOnTheScreen()
    })
  })
})
