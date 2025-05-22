import { getActiveCollection } from '../operations/getActiveCollection'

jest.mock('@/home/operations/getActiveCollection/getActiveCollection')

const fn = getActiveCollection as jest.MockedFunction<
  typeof getActiveCollection
>

export default function mockActiveCollectionError(error: Error) {
  fn.mockRejectedValueOnce(error)
}
