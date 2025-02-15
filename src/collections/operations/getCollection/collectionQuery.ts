import { queryOptions, skipToken } from '@tanstack/react-query'
import baseQueryKey from '../baseQueryKey'
import getCollection from './getCollection'

export default function collectionQuery(id?: number) {
  return queryOptions({
    queryKey: [baseQueryKey, 'detail', id],
    queryFn: typeof id === 'undefined' ? skipToken : () => getCollection(id),
  })
}
