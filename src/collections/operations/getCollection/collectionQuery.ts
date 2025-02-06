import { queryOptions } from '@tanstack/react-query'
import baseQueryKey from '../baseQueryKey'
import getCollection from './getCollection'

export default function collectionQuery(id: number) {
  return queryOptions({
    queryKey: [baseQueryKey, 'detail', id],
    queryFn: () => getCollection(id),
  })
}
