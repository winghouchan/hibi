import { updateNote } from '../operations/updateNote'

jest.mock('@/notes/operations/updateNote/updateNote')

const fn = updateNote as jest.MockedFunction<typeof updateNote>

export default function mockUpdateNoteError(error: Error) {
  fn.mockRejectedValueOnce(error)
}
