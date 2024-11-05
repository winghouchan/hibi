import { render, userEvent, waitFor } from '@testing-library/react-native'
import { renderRouter, screen } from 'expo-router/testing-library'
import { Alert } from 'react-native'
import { mockAppRoot } from 'test/utils'
import { isOnboardingCompleteQuery } from '../../operations'
import WelcomeScreen from '.'

jest.mock('@/onboarding/operations/isOnboardingComplete')
jest.mock('expo-router')

function mockOnboardedState(onboarded: boolean) {
  ;(
    isOnboardingCompleteQuery.queryFn as jest.MockedFunction<
      Exclude<typeof isOnboardingCompleteQuery.queryFn, symbol | undefined>
    >
  ).mockResolvedValue(onboarded)
}

describe('<WelcomeScreen />', () => {
  describe('when onboarding has been completed', () => {
    it('redirects to the home screen', async () => {
      mockOnboardedState(true)

      renderRouter(
        {
          index: WelcomeScreen,
          '(app)/index': () => null,
        },
        {
          wrapper: mockAppRoot(),
        },
      )

      await waitFor(() => {
        expect(screen).toHaveRouterState(
          expect.objectContaining({
            routes: [expect.objectContaining({ name: '(app)/index' })],
          }),
        )
      })
    })
  })

  describe('when onboarding has not been completed', () => {
    it('shows a button to start onboarding', async () => {
      mockOnboardedState(false)

      render(<WelcomeScreen />, { wrapper: mockAppRoot() })

      expect(
        await screen.findByTestId('onboarding.welcome.cta.button'),
      ).toBeVisible()
    })

    test('pressing the button to start onboarding navigates to the first onboarding screen', async () => {
      const user = userEvent.setup()

      mockOnboardedState(false)

      renderRouter(
        {
          index: WelcomeScreen,
          'onboarding/collection': () => null,
        },
        {
          wrapper: mockAppRoot(),
        },
      )

      await user.press(
        await screen.findByTestId('onboarding.welcome.cta.button'),
      )

      expect(screen).toHavePathname('/onboarding/collection')
    })
  })

  describe('when there is an error getting the onboarding state', () => {
    it('alerts the user', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert')

      ;(
        isOnboardingCompleteQuery.queryFn as jest.MockedFunction<
          Exclude<typeof isOnboardingCompleteQuery.queryFn, symbol | undefined>
        >
      ).mockRejectedValue(new Error('Mock Error'))

      render(<WelcomeScreen />, { wrapper: mockAppRoot() })

      await waitFor(() => expect(alertSpy).toHaveBeenCalledOnce())
    })
  })
})
