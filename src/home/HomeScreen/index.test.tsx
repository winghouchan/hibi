import { screen, waitFor } from '@testing-library/react-native'
import { renderRouter } from 'expo-router/testing-library'
import { Alert } from 'react-native'
import { mockNextReview, mockNextReviewError } from '@/reviews/test'
import { mockAppRoot } from 'test/utils'
import HomeScreen from '.'

describe('<HomeScreen />', () => {
  test.each([
    {
      name: 'when there are due reviewables, shows the link to start a review',
      fixture: {
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

    renderRouter(
      { index: HomeScreen },
      { initialUrl: '/', wrapper: mockAppRoot() },
    )

    await waitFor(expected)
  })

  test('when there is an error getting the next review, the user is alerted', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert')

    mockNextReviewError(new Error('Mock Error'))

    renderRouter(
      { index: HomeScreen },
      { initialUrl: '/', wrapper: mockAppRoot() },
    )

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledOnce()
    })
  })
})
