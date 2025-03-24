import { userEvent, waitFor } from '@testing-library/react-native'
import { Stack } from 'expo-router'
import { renderRouter, screen } from 'expo-router/testing-library'
import { ErrorBoundary } from 'react-error-boundary'
import { View } from 'react-native'
import { mockOnboardedState, mockOnboardedStateError } from '@/onboarding/test'
import { mockAppRoot } from 'test/utils'
import WelcomeScreen from '.'

const routerMock = {
  _layout: () => (
    <Stack
      screenLayout={({ children }) => (
        <ErrorBoundary
          fallback={<View testID="error-boundary-fallback-mock" />}
        >
          {children}
        </ErrorBoundary>
      )}
    />
  ),
  '(app)/(tabs)/index': () => null,
  'onboarding/collection': () => null,
  index: WelcomeScreen,
} satisfies Parameters<typeof renderRouter>[0]

describe('<WelcomeScreen />', () => {
  describe('when onboarding has been completed', () => {
    it('redirects to the home screen', async () => {
      mockOnboardedState(true)

      renderRouter(routerMock, { wrapper: mockAppRoot() })

      await waitFor(() => {
        expect(screen).toHaveRouterState(
          expect.objectContaining({
            routes: [expect.objectContaining({ name: '(app)/(tabs)/index' })],
          }),
        )
      })
    })
  })

  describe('when onboarding has not been completed', () => {
    it('shows a button to start onboarding', async () => {
      mockOnboardedState(false)

      renderRouter(
        { _layout: () => <Stack />, index: WelcomeScreen },
        { wrapper: mockAppRoot() },
      )

      expect(
        await screen.findByTestId('onboarding.welcome.cta.button'),
      ).toBeVisible()
    })

    test('pressing the button to start onboarding navigates to the first onboarding screen', async () => {
      const user = userEvent.setup()

      mockOnboardedState(false)

      renderRouter(routerMock, { wrapper: mockAppRoot() })

      await user.press(
        await screen.findByTestId('onboarding.welcome.cta.button'),
      )

      expect(screen).toHavePathname('/onboarding/collection')
    })
  })

  describe('when there is an error getting the onboarding state', () => {
    test('an error message is shown', async () => {
      // Suppress console error from the error mock
      jest.spyOn(console, 'error').mockImplementation()

      mockOnboardedStateError(new Error('Mock Error'))

      renderRouter(routerMock, { wrapper: mockAppRoot() })

      expect(
        await screen.findByTestId('error-boundary-fallback-mock'),
      ).toBeOnTheScreen()
    })
  })
})
