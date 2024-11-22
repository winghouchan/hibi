import { createCollection } from '../operations/createCollection'

jest.mock('@/collections/operations/createCollection/createCollection')

const fn = createCollection as jest.MockedFunction<typeof createCollection>

export default function mockCreateCollection(
  mock: Parameters<(typeof fn)['mockResolvedValueOnce']>[0],
) {
  fn.mockResolvedValueOnce(mock)
}
