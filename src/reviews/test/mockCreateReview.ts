import { createReview } from '../operations/createReview'

jest.mock('@/reviews/operations/createReview/createReview')

const fn = createReview as jest.MockedFunction<typeof createReview>

export default function mockCreateReview(
  mock: Parameters<(typeof fn)['mockResolvedValueOnce']>[0],
) {
  fn.mockResolvedValueOnce(mock)
}
