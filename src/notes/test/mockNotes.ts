import { getNotes } from '../operations/getNotes'

jest.mock('@/notes/operations/getNotes/getNotes')

const fn = getNotes as jest.MockedFunction<typeof getNotes>

export default function mockNotes(
  mock: Parameters<(typeof fn)['mockResolvedValueOnce']>[0],
) {
  fn.mockResolvedValueOnce(mock)
}
