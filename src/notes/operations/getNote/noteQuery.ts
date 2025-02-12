import { queryOptions, skipToken } from '@tanstack/react-query'
import getNote from './getNote'

export default function noteQuery(id?: number) {
  return queryOptions({
    queryKey: ['notes', 'byId', id],
    queryFn:
      typeof id === 'undefined' ? skipToken : async () => await getNote(id),
  })
}
