import { getNote } from '../operations/getNote'

jest.mock('@/notes/operations/getNote/getNote')

const fn = getNote as jest.MockedFunction<typeof getNote>

export default function mockGetNoteError(error: Error) {
  fn.mockRejectedValueOnce(error)
}
