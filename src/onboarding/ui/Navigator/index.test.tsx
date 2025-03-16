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

const routerMock = {
  _layout: () => <Stack />,
  '(app)/_layout': () => <Stack />,
  '(app)/(tabs)/_layout': () => <Stack />,
  '(app)/(tabs)/index': () => null,
  'onboarding/_layout': OnboardingNavigator,
  'onboarding/index': () => null,
  'onboarding/notes/[id]/edit': () => null,
  'onboarding/notes/new': () => null,
  index: () => null,
} satisfies Parameters<typeof renderRouter>[0]

describe('<OnboardingNavigator />', () => {
  describe('when onboarding is complete', () => {
    it('redirects to the home screen', async () => {
      const onboardedStateMock = mockOnboardedState(true)

      renderRouter(routerMock, {
        initialUrl: 'onboarding',
        wrapper: mockAppRoot(),
      })

      await waitFor(() => {
        expect(screen).toHaveRouterState(
          expect.objectContaining({
            routes: [
              expect.objectContaining({
                name: '(app)',
                params: {
                  screen: '(tabs)',
                  params: expect.objectContaining({ screen: 'index' }),
                },
              }),
            ],
          }),
        )
      })

      onboardedStateMock.mockReset()
    })
  })

  describe('when onboarding is incomplete', () => {
    it('does not redirect to the home screen', async () => {
      const onboardedStateMock = mockOnboardedState(false)

      renderRouter(routerMock, {
        initialUrl: 'onboarding',
        wrapper: mockAppRoot(),
      })

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

      renderRouter(routerMock, {
        initialUrl: 'onboarding',
        wrapper: mockAppRoot(),
      })

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

      renderRouter(routerMock, {
        initialUrl: 'onboarding',
        wrapper: mockAppRoot(),
      })

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledOnce()
      })

      onboardedStateMock.mockReset()
      onboardingCollectionErrorMock.mockReset()
    })
  })
})
