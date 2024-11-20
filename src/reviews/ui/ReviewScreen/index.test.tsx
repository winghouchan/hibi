import { screen, userEvent, waitFor } from '@testing-library/react-native'
import { useRouter } from 'expo-router'
import { renderRouter } from 'expo-router/testing-library'
import { Alert } from 'react-native'
import { createReview, getNextReview } from '@/reviews/operations'
import { mockAppRoot } from 'test/utils'
import ReviewScreen from '.'

jest.mock('@/reviews/operations/createReview/createReview')
jest.mock('@/reviews/operations/nextReview/getNextReview')

function mockNextReview(value: Awaited<ReturnType<typeof getNextReview>>) {
  ;(
    getNextReview as jest.MockedFunction<typeof getNextReview>
  ).mockResolvedValueOnce(value)
}

function mockNextReviewError(error: Error) {
  ;(
    getNextReview as jest.MockedFunction<typeof getNextReview>
  ).mockRejectedValue(error)
}

function mockCreateReviewError(error: Error) {
  ;(createReview as jest.MockedFunction<typeof createReview>).mockRejectedValue(
    error,
  )
}

const routerMock = {
  back: jest.fn(),
  canDismiss: jest.fn(),
  canGoBack: jest.fn(),
  dismiss: jest.fn(),
  dismissAll: jest.fn(),
  navigate: jest.fn(),
  push: jest.fn(),
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
  routerMock,
)

describe('<ReviewScreen />', () => {
  test.each([
    {
      name: 'when there is one reviewable, it can be reviewed with rating: forgot',
      inputs: [
        {
          reviewable: {
            id: 1,
            fields: [
              [{ side: 0, position: 0, value: 'Front 1' }],
              [{ side: 1, position: 0, value: 'Back 1' }],
            ],
          },
          rating: Ratings[1],
        },
      ],
    },
    {
      name: 'when there is one reviewable, it can be reviewed with rating: hard',
      inputs: [
        {
          reviewable: {
            id: 1,
            fields: [
              [{ side: 0, position: 0, value: 'Front 1' }],
              [{ side: 1, position: 0, value: 'Back 1' }],
            ],
          },
          rating: Ratings[1],
        },
      ],
    },
    {
      name: 'when there is one reviewable, it can be reviewed with rating: good',
      inputs: [
        {
          reviewable: {
            id: 1,
            fields: [
              [{ side: 0, position: 0, value: 'Front 1' }],
              [{ side: 1, position: 0, value: 'Back 1' }],
            ],
          },
          rating: Ratings[1],
        },
      ],
    },
    {
      name: 'when there is one reviewable, it can be reviewed with rating: easy',
      inputs: [
        {
          reviewable: {
            id: 1,
            fields: [
              [{ side: 0, position: 0, value: 'Front 1' }],
              [{ side: 1, position: 0, value: 'Back 1' }],
            ],
          },
          rating: Ratings[1],
        },
      ],
    },
    {
      name: 'when there are multiple reviewables, they can be reviewed with each rating',
      inputs: [
        {
          reviewable: {
            id: 1,
            fields: [
              [{ side: 0, position: 0, value: 'Front 1' }],
              [{ side: 1, position: 0, value: 'Back 1' }],
            ],
          },
          rating: Ratings[1],
        },
        {
          reviewable: {
            id: 2,
            fields: [
              [{ side: 0, position: 0, value: 'Front 2' }],
              [{ side: 1, position: 0, value: 'Back 2' }],
            ],
          },
          rating: Ratings[2],
        },
        {
          reviewable: {
            id: 3,
            fields: [
              [{ side: 0, position: 0, value: 'Front 3' }],
              [{ side: 1, position: 0, value: 'Back 3' }],
            ],
          },
          rating: Ratings[3],
        },
        {
          reviewable: {
            id: 4,
            fields: [
              [{ side: 0, position: 0, value: 'Front 4' }],
              [{ side: 1, position: 0, value: 'Back 4' }],
            ],
          },
          rating: Ratings[4],
        },
      ],
    },
  ])('$name', async ({ inputs }) => {
    const user = userEvent.setup()

    mockNextReview(inputs[0].reviewable)

    renderRouter(
      { '(app)/review': ReviewScreen },
      { initialUrl: '(app)/review', wrapper: mockAppRoot() },
    )

    for (let index = 0; index < inputs.length; index++) {
      expect(
        await screen.findByText(new RegExp(`Front ${index + 1}`)),
      ).toBeOnTheScreen()

      await user.press(screen.getByRole('button', { name: 'Show answer' }))

      expect(
        await screen.findByText(new RegExp(`Back ${index + 1}`)),
      ).toBeOnTheScreen()

      mockNextReview(inputs[index + 1]?.reviewable ?? null)

      await user.press(
        // @ts-ignore: "ts2345: Type 'undefined' is not assignable to type 'ReactTestInstance'"
        // If there is no button (i.e. the value is `undefined`) the test should fail at run time.
        screen.getAllByRole('button', { name: inputs[index].rating }).at(-1),
      )

      expect(createReview).toHaveBeenCalledWith({
        reviewable: inputs[index].reviewable.id,
        rating: Ratings[inputs[index].rating as keyof typeof Ratings],
        duration: expect.any(Number),
      })
    }

    expect(await screen.findByText(/Finished/)).toBeOnTheScreen()

    await user.press(screen.getByRole('button', { name: 'Finish' }))

    expect(routerMock.back).toHaveBeenCalledOnce()
  })

  test('when there is an error getting the initial reviewable, the user is alerted', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert')

    mockNextReviewError(new Error('Mock Error'))

    renderRouter(
      { '(app)/review': ReviewScreen },
      { initialUrl: '(app)/review', wrapper: mockAppRoot() },
    )

    await waitFor(async () => expect(alertSpy).toHaveBeenCalledOnce())
  })

  test('when there is an error getting the next reviewable, the user is alerted', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert')
    const user = userEvent.setup()

    const input = {
      reviewable: {
        id: 1,
        fields: [
          [{ side: 0, position: 0, value: 'Front 1' }],
          [{ side: 1, position: 0, value: 'Back 1' }],
        ],
      },
      rating: Ratings[1],
    }

    mockNextReview(input.reviewable)

    renderRouter(
      { '(app)/review': ReviewScreen },
      { initialUrl: '(app)/review', wrapper: mockAppRoot() },
    )

    await screen.findByText(/Front/)

    await user.press(screen.getByRole('button', { name: 'Show answer' }))

    mockNextReviewError(new Error('Mock Error'))

    await user.press(screen.getByRole('button', { name: Ratings[1] }))

    await waitFor(async () => expect(alertSpy).toHaveBeenCalledOnce())
  })

  test('when there is an error submitting the review, the user is alerted', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert')
    const user = userEvent.setup()

    const input = {
      reviewable: {
        id: 1,
        fields: [
          [{ side: 0, position: 0, value: 'Front 1' }],
          [{ side: 1, position: 0, value: 'Back 1' }],
        ],
      },
      rating: Ratings[1],
    }

    mockNextReview(input.reviewable)
    mockCreateReviewError(new Error('Mock Error'))

    renderRouter(
      { '(app)/review': ReviewScreen },
      { initialUrl: '(app)/review', wrapper: mockAppRoot() },
    )

    await screen.findByText(/Front/)

    await user.press(screen.getByRole('button', { name: 'Show answer' }))
    await user.press(screen.getByRole('button', { name: Ratings[1] }))

    await waitFor(async () => expect(alertSpy).toHaveBeenCalledOnce())
  })
})
