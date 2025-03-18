import { screen, waitFor } from '@testing-library/react-native'
import { Stack } from 'expo-router'
import { renderRouter } from 'expo-router/testing-library'
import { mockOnboardedState } from '@/onboarding/test'
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
      mockOnboardedState(true)

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
    })
  })

  describe('when onboarding is incomplete', () => {
    it('does not redirect to the home screen', async () => {
      mockOnboardedState(false)

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
    })
  })

  describe('when there is an error from a screen in the navigator', () => {
    it('shows an error message and button to try again', async () => {
      // Suppress console error from the error mock
      jest.spyOn(console, 'error').mockImplementation()

      mockOnboardedState(false)

      renderRouter(
        {
          ...routerMock,
          'onboarding/collection': () => {
            throw new Error('Mock Error')
          },
        },
        {
          initialUrl: 'onboarding/collection',
          wrapper: mockAppRoot(),
        },
      )

      expect(await screen.findByText('Something went wrong')).toBeOnTheScreen()
      expect(
        await screen.findByRole('button', { name: 'Try again' }),
      ).toBeOnTheScreen()
    })
  })
})
