import { updateNote } from '../operations/updateNote'

jest.mock('@/notes/operations/updateNote/updateNote')

const fn = updateNote as jest.MockedFunction<typeof updateNote>

export default function mockUpdateNote(
  mock: Parameters<(typeof fn)['mockResolvedValueOnce']>[0],
) {
  fn.mockResolvedValueOnce(mock)
}
