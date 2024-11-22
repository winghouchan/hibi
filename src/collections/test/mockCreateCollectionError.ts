import { createCollection } from '../operations/createCollection'

jest.mock('@/collections/operations/createCollection/createCollection')

const fn = createCollection as jest.MockedFunction<typeof createCollection>

export default function mockCreateCollectionError(error: Error) {
  fn.mockRejectedValueOnce(error)
}
