import { queryOptions, skipToken } from '@tanstack/react-query'
import baseQueryKey from '../baseQueryKey'
import getCollection from './getCollection'

export default function collectionQuery(
  ...args: Parameters<typeof getCollection>
) {
  const [{ filter }] = args

  return queryOptions({
    queryKey: [baseQueryKey, 'detail', ...args],
    queryFn: Object.values(filter).some((value) => typeof value !== 'undefined')
      ? () => getCollection(...args)
      : skipToken,
  })
}
