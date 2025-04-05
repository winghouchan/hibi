import { act, screen, userEvent, waitFor } from '@testing-library/react-native'
import { DEFAULT_MIN_PRESS_DURATION } from '@testing-library/react-native/build/user-event/press/press'
import { addHours } from 'date-fns'
import { Stack, useRouter } from 'expo-router'
import { renderRouter } from 'expo-router/testing-library'
import { ErrorBoundary } from 'react-error-boundary'
import { Alert, View } from 'react-native'
import { createReview } from '@/reviews/operations/createReview'
import {
  mockCreateReviewError,
  mockNextReviews,
  mockNextReviewsError,
} from '@/reviews/test'
import { mockAppRoot } from 'test/utils'
import ReviewScreen from '.'

jest.mock('@/reviews/operations/createReview/createReview')

const expoRouterMock = {
  back: jest.fn(),
  canDismiss: jest.fn(),
  canGoBack: jest.fn(),
  dismiss: jest.fn(),
  dismissAll: jest.fn(),
  dismissTo: jest.fn(),
  navigate: jest.fn(),
  push: jest.fn(),
  reload: jest.fn(),
  replace: jest.fn(),
  setParams: jest.fn(),
}

enum Ratings {
  Forgot = 1,
  Hard = 2,
  Good = 3,
  Easy = 4,
}

;(useRouter as jest.MockedFunction<typeof useRouter>).mockReturnValue(
  expoRouterMock,
)

const routerMock = {
  '(onboarded)/_layout': () => (
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
  '(onboarded)/review': ReviewScreen,
} satisfies Parameters<typeof renderRouter>[0]

describe('<ReviewScreen />', () => {
  test('when there are no reviewables, a message is shown', async () => {
    mockNextReviews({ reviewables: [] })

    renderRouter(routerMock, {
      initialUrl: '(onboarded)/review',
      wrapper: mockAppRoot(),
    })

    expect(await screen.findByText('No reviews due')).toBeOnTheScreen()
  })

  test.each([
    {
      name: 'when there is one reviewable, it can be reviewed with rating: forgot',
      fixture: {
        reviewables: [
          {
            id: 1,
            fields: [
              [{ side: 0, position: 0, value: 'Front 1' }],
              [{ side: 1, position: 0, value: 'Back 1' }],
            ],
          },
        ],
      },
      input: {
        ratings: [Ratings[1]],
      },
    },
    {
      name: 'when there is one reviewable, it can be reviewed with rating: hard',
      fixture: {
        reviewables: [
          {
            id: 1,
            fields: [
              [{ side: 0, position: 0, value: 'Front 1' }],
              [{ side: 1, position: 0, value: 'Back 1' }],
            ],
          },
        ],
      },
      input: {
        ratings: [Ratings[1]],
      },
    },
    {
      name: 'when there is one reviewable, it can be reviewed with rating: good',
      fixture: {
        reviewables: [
          {
            id: 1,
            fields: [
              [{ side: 0, position: 0, value: 'Front 1' }],
              [{ side: 1, position: 0, value: 'Back 1' }],
            ],
          },
        ],
      },
      input: {
        ratings: [Ratings[1]],
      },
    },
    {
      name: 'when there is one reviewable, it can be reviewed with rating: easy',
      fixture: {
        reviewables: [
          {
            id: 1,
            fields: [
              [{ side: 0, position: 0, value: 'Front 1' }],
              [{ side: 1, position: 0, value: 'Back 1' }],
            ],
          },
        ],
      },
      input: {
        ratings: [Ratings[1]],
      },
    },
    {
      name: 'when there are multiple reviewables, they can be reviewed with each rating',
      fixture: {
        reviewables: [
          {
            id: 1,
            fields: [
              [{ side: 0, position: 0, value: 'Front 1' }],
              [{ side: 1, position: 0, value: 'Back 1' }],
            ],
          },
          {
            id: 2,
            fields: [
              [{ side: 0, position: 0, value: 'Front 2' }],
              [{ side: 1, position: 0, value: 'Back 2' }],
            ],
          },
          {
            id: 3,
            fields: [
              [{ side: 0, position: 0, value: 'Front 3' }],
              [{ side: 1, position: 0, value: 'Back 3' }],
            ],
          },
          {
            id: 4,
            fields: [
              [{ side: 0, position: 0, value: 'Front 4' }],
              [{ side: 1, position: 0, value: 'Back 4' }],
            ],
          },
        ],
      },
      input: {
        ratings: [Ratings[1], Ratings[2], Ratings[3], Ratings[4]],
      },
    },
  ])('$name', async ({ fixture, input }) => {
    /**
     * Simulates the amount of time in milliseconds it takes for the user to
     * recall an answer after seeing the prompt.
     */
    const recallTime = 2000

    const user = userEvent.setup()

    mockNextReviews(fixture)

    renderRouter(routerMock, {
      initialUrl: '(onboarded)/review',
      wrapper: mockAppRoot(),
    })

    for (let index = 0; index < fixture.reviewables.length; index++) {
      expect(
        await screen.findByText(new RegExp(`Front ${index + 1}`), {
          interval: 0,
        }),
      ).toBeOnTheScreen()

      await act(async () => {
        // Wait for `recallTime` to elapse
        await new Promise((resolve) => {
          setTimeout(resolve, recallTime)
          jest.advanceTimersByTime(recallTime)
        })
      })

      await user.press(
        // @ts-ignore: "ts2345: Type 'undefined' is not assignable to type 'ReactTestInstance'"
        // If there is no button (i.e. the value is `undefined`) the test should fail at run time.
        screen.getAllByRole('button', { name: 'Show answer' }).at(0),
      )

      expect(
        await screen.findByText(new RegExp(`Back ${index + 1}`)),
      ).toBeOnTheScreen()

      await user.press(
        // @ts-ignore: "ts2345: Type 'undefined' is not assignable to type 'ReactTestInstance'"
        // If there is no button (i.e. the value is `undefined`) the test should fail at run time.
        screen.getAllByRole('button', { name: input.ratings[index] }).at(-1),
      )

      expect(createReview).toHaveBeenCalledWith({
        reviewable: fixture.reviewables[index].id,
        rating: Ratings[input.ratings[index] as keyof typeof Ratings],

        /**
         * The duration is the total amount of time to:
         *
         * - Recall the answer for the prompt. It is represented by `recallTime`.
         * - Press the button to show the answer. It is represented by the variable
         *   `DEFAULT_MIN_PRESS_DURATION` from `@testing-library/react-native`. By
         *   default it is 130 ms to match the time set by React Native's source.
         *   See: https://github.com/facebook/react-native/blob/50e38cc9f1e6713228a91ad50f426c4f65e65e1a/packages/react-native/Libraries/Pressability/Pressability.js#L264
         *
         * Also important is the time taken to asynchronously query for elements
         * using `findBy*` (if any). By default, queries occur at 50 ms intervals
         * (see: https://callstack.github.io/react-native-testing-library/cookbook/basics/async-tests#findby-queries)
         * Setting `interval` in the options argument to `findBy*` to `0` means
         * the time to query doesn't need to be accounted for below.
         */
        duration: recallTime + DEFAULT_MIN_PRESS_DURATION,
      })
    }

    expect(await screen.findByText(/Finished/)).toBeOnTheScreen()

    await user.press(screen.getByRole('button', { name: 'Finish' }))

    expect(expoRouterMock.back).toHaveBeenCalledOnce()
  })

  test('when there is an error getting the reviewables, an error message is shown', async () => {
    // Suppress console error from the error mock
    jest.spyOn(console, 'error').mockImplementation()

    mockNextReviewsError(new Error('Mock Error'))

    renderRouter(routerMock, {
      initialUrl: '(onboarded)/review',
      wrapper: mockAppRoot(),
    })

    expect(
      await screen.findByTestId('error-boundary-fallback-mock'),
    ).toBeOnTheScreen()
  })

  test('when there is an error submitting the review, the user is alerted', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert')
    const user = userEvent.setup()

    const fixture = {
      reviewable: {
        id: 1,
        fields: [
          [{ side: 0, position: 0, value: 'Front 1' }],
          [{ side: 1, position: 0, value: 'Back 1' }],
        ],
      },
    }

    const input = {
      rating: Ratings[1],
    }

    mockNextReviews({ reviewables: [fixture.reviewable] })
    mockCreateReviewError(new Error('Mock Error'))

    renderRouter(routerMock, {
      initialUrl: '(onboarded)/review',
      wrapper: mockAppRoot(),
    })

    await screen.findByText(/Front/)

    await user.press(screen.getByRole('button', { name: 'Show answer' }))
    await user.press(screen.getByRole('button', { name: input.rating }))

    await waitFor(async () => expect(alertSpy).toHaveBeenCalledOnce())
  })

  test('when the user changes the time during a review, the review duration should not be affected', async () => {
    /**
     * Simulates the amount of time in milliseconds it takes for the user to
     * recall an answer after seeing the prompt.
     */
    const recallTime = 2000

    const user = userEvent.setup()

    const fixture = {
      reviewable: {
        id: 1,
        fields: [
          [{ side: 0, position: 0, value: 'Front 1' }],
          [{ side: 1, position: 0, value: 'Back 1' }],
        ],
      },
    }

    const input = {
      rating: Ratings[1],
    }

    mockNextReviews({ reviewables: [fixture.reviewable] })

    renderRouter(routerMock, {
      initialUrl: '(onboarded)/review',
      wrapper: mockAppRoot(),
    })

    await screen.findByText(/Front/, { interval: 0 })

    jest.setSystemTime(addHours(new Date(), 1))

    await act(async () => {
      // Wait for `recallTime` to elapse
      await new Promise((resolve) => {
        setTimeout(resolve, recallTime)
        jest.advanceTimersByTime(recallTime)
      })
    })

    await user.press(screen.getByRole('button', { name: 'Show answer' }))

    mockNextReviews({ reviewables: [] })

    await user.press(screen.getByRole('button', { name: input.rating }))

    expect(createReview).toHaveBeenCalledWith({
      reviewable: fixture.reviewable.id,
      rating: Ratings[input.rating as keyof typeof Ratings],
      duration: recallTime + DEFAULT_MIN_PRESS_DURATION,
    })

    jest.setSystemTime()
  })
})
