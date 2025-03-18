import { screen, waitFor } from '@testing-library/react-native'
import { renderRouter } from 'expo-router/testing-library'
import { mockOnboardedState } from '@/onboarding/test'
import { mockAppRoot } from 'test/utils'
import AppLayout from '.'

const routerMock = {
  '(app)/_layout': AppLayout,
  '(app)/index': () => null,
  '(app)/review': () => null,
  index: () => null,
} satisfies Parameters<typeof renderRouter>[0]

describe('<AppLayout />', () => {
  describe('when onboarding has not been completed', () => {
    it('redirects to the welcome screen', async () => {
      mockOnboardedState(false)

      renderRouter(routerMock, {
        initialUrl: '(app)',
        wrapper: mockAppRoot(),
      })

      await waitFor(() => {
        expect(screen).toHaveRouterState(
          expect.objectContaining({
            index: 0,
            routes: [expect.objectContaining({ name: 'index' })],
          }),
        )
      })
    })
  })

  describe('when onboarding has been completed', () => {
    it('does not redirect to the welcome screen', async () => {
      mockOnboardedState(true)

      renderRouter(routerMock, {
        initialUrl: '(app)',
        wrapper: mockAppRoot(),
      })

      await waitFor(() => {
        expect(screen).toHaveRouterState(
          expect.objectContaining({
            routes: [
              expect.objectContaining({
                name: '(app)',
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

  describe('when there is an error from a screen in the navigator', () => {
    it('shows an error message and button to try again', async () => {
      // Suppress console error from the error mock
      jest.spyOn(console, 'error').mockImplementation()

      mockOnboardedState(true)

      renderRouter(
        {
          ...routerMock,
          '(app)/index': () => {
            throw new Error('Mock Error')
          },
        },
        { initialUrl: '(app)', wrapper: mockAppRoot() },
      )

      expect(await screen.findByText('Something went wrong')).toBeOnTheScreen()
      expect(
        await screen.findByRole('button', { name: 'Try again' }),
      ).toBeOnTheScreen()
    })
  })
})
