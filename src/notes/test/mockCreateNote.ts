import { createNote } from '../operations/createNote'

jest.mock('@/notes/operations/createNote/createNote')

const fn = createNote as jest.MockedFunction<typeof createNote>

export default function mockCreateNote(
  mock: Parameters<(typeof fn)['mockResolvedValueOnce']>[0],
) {
  fn.mockResolvedValueOnce(mock)
}
