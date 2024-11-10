import { screen } from '@testing-library/react-native'
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

      expect(screen).toHavePathname('/')
    })
  })

  describe('when onboarding has been completed', () => {
    it('does not redirect to the welcome screen', () => {
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

      expect(screen).toHavePathname('/')
    })
  })
})
