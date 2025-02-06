import { getCollection } from '../operations/getCollection'

jest.mock('@/collections/operations/getCollection/getCollection')

const fn = getCollection as jest.MockedFunction<typeof getCollection>

export default function mockCollections(
  mock: Parameters<(typeof fn)['mockResolvedValueOnce']>[0],
) {
  fn.mockResolvedValueOnce(mock)
}
