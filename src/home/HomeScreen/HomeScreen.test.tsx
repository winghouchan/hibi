import { screen, waitFor } from '@testing-library/react-native'
import { Stack } from 'expo-router'
import { renderRouter } from 'expo-router/testing-library'
import { ErrorBoundary } from 'react-error-boundary'
import { View } from 'react-native'
import { mockCollections, mockCollectionsError } from '@/collections/test'
import { mockNextReviews, mockNextReviewsError } from '@/reviews/test'
import { mockAppRoot } from 'test/utils'
import HomeScreen from './HomeScreen'

const routerMock = {
  _layout: () => (
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
  index: HomeScreen,
} satisfies Parameters<typeof renderRouter>[0]

describe('<HomeScreen />', () => {
  test.each([
    {
      name: 'when there are due reviewables, shows the link to start a review',
      fixture: {
        collections: [
          { id: 1, name: 'Collection Name', createdAt: new Date() },
        ],
        reviewables: [
          {
            id: 1,
            fields: [],
          },
        ],
      },
      expected: async () => {
        expect(
          await screen.findByRole('link', { name: 'Start review' }),
        ).toBeOnTheScreen()
      },
    },
    {
      name: 'when there are no due reviewables, does not show the link to start a review',
      fixture: {
        collections: [
          { id: 1, name: 'Collection Name', createdAt: new Date() },
        ],
        reviewables: [],
      },
      expected: async () => {
        expect(
          screen.queryByRole('link', { name: 'Start review' }),
        ).not.toBeOnTheScreen()
      },
    },
  ])('$name', async ({ expected, fixture }) => {
    mockNextReviews({ reviewables: fixture.reviewables })
    mockCollections({
      cursor: { next: undefined },
      collections: fixture.collections,
    })

    renderRouter(routerMock, { initialUrl: '/', wrapper: mockAppRoot() })

    expect(await screen.findByTestId('home.screen')).toBeOnTheScreen()

    await waitFor(expected)
  })

  test('when there is an error getting the collections, an error message is shown', async () => {
    // Suppress console error from the error mock
    jest.spyOn(console, 'error').mockImplementation()

    mockCollectionsError(new Error('Mock Error'))
    mockNextReviews({ reviewables: [] })

    renderRouter(routerMock, { initialUrl: '/', wrapper: mockAppRoot() })

    expect(
      await screen.findByTestId('error-boundary-fallback-mock'),
    ).toBeOnTheScreen()
  })

  test('when there is an error getting the next review, an error message is shown', async () => {
    // Suppress console error from the error mock
    jest.spyOn(console, 'error').mockImplementation()

    mockCollections({
      cursor: { next: undefined },
      collections: [{ id: 1, name: 'Collection Name', createdAt: new Date() }],
    })
    mockNextReviewsError(new Error('Mock Error'))

    renderRouter(routerMock, { initialUrl: '/', wrapper: mockAppRoot() })

    expect(
      await screen.findByTestId('error-boundary-fallback-mock'),
    ).toBeOnTheScreen()
  })
})
