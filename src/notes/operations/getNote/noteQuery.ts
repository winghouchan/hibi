import { queryOptions } from '@tanstack/react-query'
import baseQueryKey from '../baseQueryKey'
import getNote from './getNote'

export default function noteQuery(id?: number) {
  return queryOptions({
    queryKey: [baseQueryKey, 'detail', id],
    queryFn:
      typeof id === 'undefined' ? () => null : async () => await getNote(id),
  })
}
