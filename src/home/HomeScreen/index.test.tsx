import { screen, waitFor } from '@testing-library/react-native'
import { renderRouter } from 'expo-router/testing-library'
import { Alert } from 'react-native'
import { mockCollections } from '@/collections/test'
import { mockNextReview, mockNextReviewError } from '@/reviews/test'
import { mockAppRoot } from 'test/utils'
import HomeScreen from '.'

const routerMock = {
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
        reviewable: {
          id: 1,
          fields: [],
        },
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
        reviewable: null,
      },
      expected: async () => {
        expect(
          screen.queryByRole('link', { name: 'Start review' }),
        ).not.toBeOnTheScreen()
      },
    },
  ])('$name', async ({ expected, fixture }) => {
    mockNextReview(fixture.reviewable)
    mockCollections(fixture.collections)

    renderRouter(routerMock, { initialUrl: '/', wrapper: mockAppRoot() })

    await waitFor(expected)
  })

  test('when there is an error getting the next review, the user is alerted', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert')

    mockCollections([{ id: 1, name: 'Collection Name', createdAt: new Date() }])
    mockNextReviewError(new Error('Mock Error'))

    renderRouter(routerMock, { initialUrl: '/', wrapper: mockAppRoot() })

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledOnce()
    })
  })
})
