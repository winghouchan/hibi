import { getActiveCollection } from '../operations/getActiveCollection'

jest.mock('@/home/operations/getActiveCollection/getActiveCollection')

const fn = getActiveCollection as jest.MockedFunction<
  typeof getActiveCollection
>

export default function mockActiveCollection(
  mock: Parameters<(typeof fn)['mockResolvedValueOnce']>[0],
) {
  fn.mockResolvedValueOnce(mock)
}
