import { getNextReviews } from '../operations/getNextReviews'

jest.mock('@/reviews/operations/getNextReviews/getNextReviews')

const fn = getNextReviews as jest.MockedFunction<typeof getNextReviews>

export default function mockNextReviewError(error: Error) {
  fn.mockRejectedValueOnce(error)
}
