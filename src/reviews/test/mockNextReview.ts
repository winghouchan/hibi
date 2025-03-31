import { getNextReview } from '../operations/getNextReview'

jest.mock('@/reviews/operations/getNextReview/getNextReview')

const fn = getNextReview as jest.MockedFunction<typeof getNextReview>

export default function mockNextReview(
  mock: Parameters<(typeof fn)['mockResolvedValueOnce']>[0],
) {
  fn.mockResolvedValueOnce(mock)
}
