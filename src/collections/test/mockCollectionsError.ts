import { getCollections } from '../operations/getCollections'

jest.mock('@/collections/operations/getCollections/getCollections')

const fn = getCollections as jest.MockedFunction<typeof getCollections>

export default function mockCollections(error: Error) {
  fn.mockRejectedValueOnce(error)
}
