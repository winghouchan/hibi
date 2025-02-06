import { getCollections } from '../operations/getCollections'

jest.mock('@/collections/operations/getCollections/getCollections')

const fn = getCollections as jest.MockedFunction<typeof getCollections>

export default function mockCollections(
  mock: Parameters<(typeof fn)['mockResolvedValueOnce']>[0],
) {
  fn.mockResolvedValueOnce(mock)
}
