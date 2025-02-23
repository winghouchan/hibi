import { screen, waitFor } from '@testing-library/react-native'
import { Stack } from 'expo-router'
import { renderRouter } from 'expo-router/testing-library'
import { Alert } from 'react-native'
import {
  mockOnboardedState,
  mockOnboardedStateError,
  mockOnboardingCollectionError,
} from '@/onboarding/test'
import { mockAppRoot } from 'test/utils'
import OnboardingNavigator from '.'

describe('<OnboardingNavigator />', () => {
  describe('when onboarding is complete', () => {
    it('redirects to the home screen', async () => {
      const onboardedStateMock = mockOnboardedState(true)

      renderRouter(
        {
          _layout: () => <Stack />,
          'onboarding/_layout': OnboardingNavigator,
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

      onboardedStateMock.mockReset()
    })
  })

  describe('when onboarding is incomplete', () => {
    it('does not redirect to the home screen', async () => {
      const onboardedStateMock = mockOnboardedState(false)

      renderRouter(
        {
          _layout: () => <Stack />,
          index: () => null,
          '(app)/_layout': () => <Stack />,
          '(app)/(tabs)/_layout': () => <Stack />,
          '(app)/(tabs)/index': () => null,
          'onboarding/_layout': OnboardingNavigator,
          'onboarding/index': () => null,
          'onboarding/notes/edit/[id]': () => null,
          'onboarding/notes/new': () => null,
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
                name: 'index',
              }),
            ],
          }),
        )
      })

      onboardedStateMock.mockReset()
    })
  })

  describe('when there is an error fetching the onboarding state', () => {
    test('the user is alerted', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert')

      const onboardedStateErrorMock = mockOnboardedStateError(
        new Error('Mock Error'),
      )

      renderRouter(
        {
          _layout: () => <Stack />,
          'onboarding/_layout': OnboardingNavigator,
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

      onboardedStateErrorMock.mockReset()
    })
  })

  describe('when there is an error fetching the onboarding collection', () => {
    test('the user is alerted', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert')

      const onboardedStateMock = mockOnboardedState(true)
      const onboardingCollectionErrorMock = mockOnboardingCollectionError(
        new Error('Mock Error'),
      )

      renderRouter(
        {
          _layout: () => <Stack />,
          'onboarding/_layout': OnboardingNavigator,
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
        expect(alertSpy).toHaveBeenCalledOnce()
      })

      onboardedStateMock.mockReset()
      onboardingCollectionErrorMock.mockReset()
    })
  })
})
