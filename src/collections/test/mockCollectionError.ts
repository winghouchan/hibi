import { getCollection } from '../operations/getCollection'

jest.mock('@/collections/operations/getCollection/getCollection')

const fn = getCollection as jest.MockedFunction<typeof getCollection>

export default function mockCollectionError(error: Error) {
  fn.mockRejectedValueOnce(error)
}
