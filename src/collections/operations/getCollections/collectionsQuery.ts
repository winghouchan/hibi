import { queryOptions } from '@tanstack/react-query'
import baseQueryKey from '../baseQueryKey'
import getCollections from './getCollections'

export default queryOptions({
  queryKey: [baseQueryKey, 'list'],
  queryFn: getCollections,
})
