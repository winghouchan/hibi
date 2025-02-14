import { queryOptions, skipToken } from '@tanstack/react-query'
import baseQueryKey from '../baseQueryKey'
import getNote from './getNote'

export default function noteQuery(id?: number) {
  return queryOptions({
    queryKey: [baseQueryKey, 'detail', id],
    queryFn:
      typeof id === 'undefined' ? skipToken : async () => await getNote(id),
  })
}
