import { screen, waitFor } from '@testing-library/react-native'
import { Stack } from 'expo-router'
import { renderRouter } from 'expo-router/testing-library'
import { ErrorBoundary } from 'react-error-boundary'
import { View } from 'react-native'
import {
  mockOnboardingCollection,
  mockOnboardingCollectionError,
} from '@/onboarding/test'
import { mockAppRoot } from 'test/utils'
import Index from '.'

const routerMock = {
  index: () => null,
  'onboarding/_layout': () => (
    <Stack
      screenLayout={({ children }) => (
        <ErrorBoundary
          fallback={<View testID="error-boundary-fallback-mock" />}
        >
          {children}
        </ErrorBoundary>
      )}
    />
  ),
  'onboarding/index': Index,
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

  describe('when there is an error getting the onboarding collection', () => {
    test('an error message is shown', async () => {
      // Suppress console error from the error mock
      jest.spyOn(console, 'error').mockImplementation()

      mockOnboardingCollectionError(new Error('Mock Error'))

      renderRouter(routerMock, {
        initialUrl: 'onboarding',
        wrapper: mockAppRoot(),
      })

      expect(
        await screen.findByTestId('error-boundary-fallback-mock'),
      ).toBeOnTheScreen()
    })
  })
})
