import { queryOptions, skipToken } from '@tanstack/react-query'
import baseQueryKey from '../baseQueryKey'
import getCollections from './getCollections'

export default function collectionsQuery(
  ...args: Parameters<typeof getCollections>
) {
  const [{ filter = undefined } = {}] = args

  return queryOptions({
    queryKey: [baseQueryKey, 'list', ...args],
    queryFn: filter
      ? Object.values(filter).some((value) =>
          Array.isArray(value) ? value.length > 0 : true,
        )
        ? () => getCollections(...args)
        : skipToken
      : () => getCollections(...args),
  })
}
