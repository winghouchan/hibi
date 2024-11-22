import { getNextReview } from '../operations/nextReview'

jest.mock('@/reviews/operations/nextReview/getNextReview')

const fn = getNextReview as jest.MockedFunction<typeof getNextReview>

export default function mockNextReviewError(error: Error) {
  fn.mockRejectedValueOnce(error)
}
