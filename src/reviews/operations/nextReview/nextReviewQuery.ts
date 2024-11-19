import { queryOptions } from '@tanstack/react-query'
import getNextReview from './getNextReview'

export default queryOptions({
  queryKey: ['reviewable', 'next'],
  queryFn: async () => await getNextReview({ onlyDue: true }),
})
