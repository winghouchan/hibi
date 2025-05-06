import { queryOptions } from '@tanstack/react-query'
import { Note } from '../../schema'
import baseQueryKey from '../baseQueryKey'
import getNote from './getNote'

export default function noteQuery(id?: Note['id']) {
  return queryOptions({
    queryKey: [baseQueryKey, 'detail', id],
    queryFn:
      typeof id === 'undefined' ? () => null : async () => await getNote(id),
  })
}
