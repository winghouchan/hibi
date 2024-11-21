import { screen, waitFor } from '@testing-library/react-native'
import { renderRouter } from 'expo-router/testing-library'
import { Alert } from 'react-native'
import { mockAppRoot } from 'test/utils'
import { isOnboardingComplete } from '../../operations'
import OnboardingLayout from '.'

jest.mock('@/onboarding/operations/isOnboardingComplete')

const isOnboardingCompleteMock = isOnboardingComplete as jest.MockedFunction<
  typeof isOnboardingComplete
>

function mockOnboardedState(onboarded: boolean) {
  isOnboardingCompleteMock.mockResolvedValueOnce(onboarded)
}

function mockOnboardedStateError(error: Error) {
  isOnboardingCompleteMock.mockRejectedValueOnce(error)
}

describe('<OnboardingLayout />', () => {
  describe('when onboarding is complete', () => {
    it('redirects to the home screen', async () => {
      mockOnboardedState(true)

      renderRouter(
        {
          'onboarding/_layout': OnboardingLayout,
          'onboarding/index': () => null,
          'onboarding/notes/new': () => null,
          'onboarding/notes/edit/[id]': () => null,
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
          'onboarding/notes/new': () => null,
          'onboarding/notes/edit/[id]': () => null,
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

  describe('when there is an error fetching the onboarding state', () => {
    test('the user is alerted', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert')

      mockOnboardedStateError(new Error('Mock Error'))

      renderRouter(
        {
          'onboarding/_layout': OnboardingLayout,
          'onboarding/index': () => null,
        },
        {
          initialUrl: 'onboarding',
          wrapper: mockAppRoot(),
        },
      )

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledOnce()
      })
    })
  })
})
