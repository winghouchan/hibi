import { getNote } from '../operations/getNote'

jest.mock('@/notes/operations/getNote/getNote')

const fn = getNote as jest.MockedFunction<typeof getNote>

export default function mockGetNote(
  mock: Parameters<(typeof fn)['mockResolvedValueOnce']>[0],
) {
  fn.mockResolvedValueOnce(mock)
}
