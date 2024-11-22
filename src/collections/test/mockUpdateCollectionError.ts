import { updateCollection } from '../operations/updateCollection'

jest.mock('@/collections/operations/updateCollection/updateCollection')

const fn = updateCollection as jest.MockedFunction<typeof updateCollection>

export default function mockUpdateCollection(error: Error) {
  fn.mockRejectedValueOnce(error)
}
