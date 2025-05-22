import { queryOptions } from '@tanstack/react-query'
import getActiveCollection from './getActiveCollection'

export default queryOptions({
  queryKey: ['collection', 'active'],
  queryFn: getActiveCollection,
})
