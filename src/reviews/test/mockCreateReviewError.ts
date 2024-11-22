import { createReview } from '../operations/createReview'

jest.mock('@/reviews/operations/createReview/createReview')

const fn = createReview as jest.MockedFunction<typeof createReview>

export default function mockCreateReviewError(error: Error) {
  fn.mockRejectedValueOnce(error)
}
