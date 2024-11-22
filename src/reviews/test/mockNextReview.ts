import { getNextReview } from '../operations/nextReview'

jest.mock('@/reviews/operations/nextReview/getNextReview')

const fn = getNextReview as jest.MockedFunction<typeof getNextReview>

export default function mockNextReview(
  mock: Parameters<(typeof fn)['mockResolvedValueOnce']>[0],
) {
  fn.mockResolvedValueOnce(mock)
}
