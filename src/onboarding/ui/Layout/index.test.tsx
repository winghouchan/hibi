import { screen, waitFor } from '@testing-library/react-native'
import { renderRouter } from 'expo-router/testing-library'
import { Alert } from 'react-native'
import {
  mockOnboardedState,
  mockOnboardedStateError,
  mockOnboardingCollectionError,
} from '@/onboarding/test'
import { mockAppRoot } from 'test/utils'
import OnboardingLayout from '.'

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
          '(app)/(tabs)/index': () => null,
        },
        {
          initialUrl: 'onboarding',
          wrapper: mockAppRoot(),
        },
      )

      await waitFor(() => {
        expect(screen).toHaveRouterState(
          expect.objectContaining({
            routes: [expect.objectContaining({ name: '(app)/(tabs)/index' })],
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
          '(app)/(tabs)/index': () => null,
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

  describe('when there is an error fetching the onboarding collection', () => {
    test('the user is alerted', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert')

      mockOnboardedState(true)
      mockOnboardingCollectionError(new Error('Mock Error'))

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
