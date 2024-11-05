import { screen, waitFor } from '@testing-library/react-native'
import { renderRouter } from 'expo-router/testing-library'
import { mockAppRoot } from 'test/utils'
import { isOnboardingCompleteQuery } from '../../operations'
import OnboardingLayout from '.'

jest.mock('@/onboarding/operations/isOnboardingComplete')

function mockOnboardedState(onboarded: boolean) {
  ;(
    isOnboardingCompleteQuery.queryFn as jest.MockedFunction<
      Exclude<typeof isOnboardingCompleteQuery.queryFn, symbol | undefined>
    >
  ).mockResolvedValue(onboarded)
}

describe('<OnboardingLayout />', () => {
  describe('when onboarding is complete', () => {
    it('redirects to the home screen', async () => {
      mockOnboardedState(true)

      renderRouter(
        {
          'onboarding/_layout': OnboardingLayout,
          'onboarding/index': () => null,
          '(app)/index': () => null,
        },
        {
          initialUrl: 'onboarding',
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
  describe('when onboarding is incomplete', () => {
    it('does not redirect to the home screen', async () => {
      mockOnboardedState(false)

      renderRouter(
        {
          'onboarding/_layout': OnboardingLayout,
          'onboarding/index': () => null,
          '(app)/index': () => null,
        },
        {
          initialUrl: 'onboarding',
          wrapper: mockAppRoot(),
        },
      )

      await waitFor(() => {
        expect(screen).toHaveRouterState(
          expect.objectContaining({
            routes: [
              expect.objectContaining({
                name: 'onboarding',
                state: expect.objectContaining({
                  routes: [expect.objectContaining({ name: 'index' })],
                }),
              }),
            ],
          }),
        )
      })
    })
  })
})
