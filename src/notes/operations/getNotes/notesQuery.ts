import { infiniteQueryOptions, skipToken } from '@tanstack/react-query'
import baseQueryKey from '../baseQueryKey'
import getNotes from './getNotes'

export default function notesQuery(...args: Parameters<typeof getNotes>) {
  const [{ filter = undefined } = {}] = args

  return infiniteQueryOptions({
    queryKey: [baseQueryKey, 'list', ...args],
    queryFn: filter
      ? Object.values(filter).some(
          (value) => Array.isArray(value) && value.length > 0,
        )
        ? ({ pageParam }) =>
            getNotes({
              ...args[0],
              pagination: { ...args[0]?.pagination, cursor: pageParam },
            })
        : skipToken
      : ({ pageParam }) =>
          getNotes({
            ...args[0],
            pagination: { ...args[0]?.pagination, cursor: pageParam },
          }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.cursor.next,
    select: (data) =>
      data.pages.reduce<(typeof data.pages)[number]['notes']>(
        (accumulator, { notes }) => [...accumulator, ...notes],
        [],
      ),
  })
}
