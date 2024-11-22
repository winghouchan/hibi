import { createNote } from '../operations/createNote'

jest.mock('@/notes/operations/createNote/createNote')

const fn = createNote as jest.MockedFunction<typeof createNote>

export default function mockCreateNoteError(error: Error) {
  fn.mockRejectedValueOnce(error)
}
