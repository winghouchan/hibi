import { screen, waitFor } from '@testing-library/react-native'
import { renderRouter } from 'expo-router/testing-library'
import { isOnboardingCompleteQuery } from '@/onboarding'
import { mockAppRoot } from 'test/utils'
import AppLayout from '.'

jest.mock('@/onboarding/operations/isOnboardingComplete')

function mockOnboardedState(onboarded: boolean) {
  ;(
    isOnboardingCompleteQuery.queryFn as jest.MockedFunction<
      Exclude<typeof isOnboardingCompleteQuery.queryFn, symbol | undefined>
    >
  ).mockResolvedValue(onboarded)
}

describe('<AppLayout />', () => {
  describe('when onboarding has not been completed', () => {
    it('redirects to the welcome screen', async () => {
      mockOnboardedState(false)

      renderRouter(
        {
          '(app)/_layout': AppLayout,
          '(app)/index': () => null,
          '(app)/review': () => null,
          index: () => null,
        },
        {
          initialUrl: '(app)',
          wrapper: mockAppRoot(),
        },
      )

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

      renderRouter(
        {
          '(app)/_layout': AppLayout,
          '(app)/index': () => null,
          '(app)/review': () => null,
          index: () => null,
        },
        {
          initialUrl: '(app)',
          wrapper: mockAppRoot(),
        },
      )

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
})
