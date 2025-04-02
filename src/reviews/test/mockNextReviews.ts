import { getNextReviews } from '../operations/getNextReviews'

jest.mock('@/reviews/operations/getNextReviews/getNextReviews')

const fn = getNextReviews as jest.MockedFunction<typeof getNextReviews>

export default function mockNextReview(
  mock: Parameters<(typeof fn)['mockResolvedValueOnce']>[0],
) {
  fn.mockResolvedValueOnce(mock)
}
