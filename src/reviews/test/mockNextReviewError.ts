import { getNextReview } from '../operations/getNextReview'

jest.mock('@/reviews/operations/getNextReview/getNextReview')

const fn = getNextReview as jest.MockedFunction<typeof getNextReview>

export default function mockNextReviewError(error: Error) {
  fn.mockRejectedValueOnce(error)
}
