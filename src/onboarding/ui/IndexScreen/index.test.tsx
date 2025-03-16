import { screen, waitFor } from '@testing-library/react-native'
import { renderRouter } from 'expo-router/testing-library'
import { mockOnboardingCollection } from '@/onboarding/test'
import { mockAppRoot } from 'test/utils'
import Index from '.'

const routerMock = {
  index: () => null,
  onboarding: Index,
  'onboarding/notes': () => null,
} satisfies Parameters<typeof renderRouter>[0]

describe('<IndexScreen />', () => {
  describe('when a collection exists', () => {
    it('redirects to the onboarding note creation screen', async () => {
      mockOnboardingCollection({
        id: 1,
        name: 'Collection Name',
        createdAt: new Date(),
      })

      renderRouter(routerMock, {
        initialUrl: 'onboarding',
        wrapper: mockAppRoot(),
      })

      await waitFor(() => {
        expect(screen).toHavePathname('/onboarding/notes')
      })
    })
  })

  describe('when a collection does not exist', () => {
    it('redirects to the welcome screen', async () => {
      mockOnboardingCollection(null)

      renderRouter(routerMock, {
        initialUrl: 'onboarding',
        wrapper: mockAppRoot(),
      })

      await waitFor(() => {
        expect(screen).toHavePathname('/')
      })
    })
  })
})
