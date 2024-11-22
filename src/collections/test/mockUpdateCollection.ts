import { updateCollection } from '../operations/updateCollection'

jest.mock('@/collections/operations/updateCollection/updateCollection')

const fn = updateCollection as jest.MockedFunction<typeof updateCollection>

export default function mockUpdateCollection(
  mock: Parameters<(typeof fn)['mockResolvedValueOnce']>[0],
) {
  fn.mockResolvedValueOnce(mock)
}
