import { getNotes } from '../operations/getNotes'

jest.mock('@/notes/operations/getNotes/getNotes')

const fn = getNotes as jest.MockedFunction<typeof getNotes>

export default function mockNotesError(error: Error) {
  fn.mockRejectedValueOnce(error)
}
