import { queryOptions, skipToken } from '@tanstack/react-query'
import baseQueryKey from '../baseQueryKey'
import getNotes from './getNotes'

export default function notesQuery(...args: Parameters<typeof getNotes>) {
  const [{ filter = undefined } = {}] = args

  return queryOptions({
    queryKey: [baseQueryKey, 'list', ...args],
    queryFn: filter
      ? Object.values(filter).some((value) =>
          Array.isArray(value) ? value.length > 0 : value !== undefined,
        )
        ? () => getNotes(...args)
        : skipToken
      : () => getNotes(...args),
  })
}
