import { infiniteQueryOptions } from '@tanstack/react-query'
import getNextReview from './getNextReview'

export default (options: Parameters<typeof getNextReview>[0]) =>
  infiniteQueryOptions({
    queryKey: ['review', options],
    queryFn: async () => await getNextReview(options),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages, lastPageParam) =>
      lastPage === null ? undefined : lastPageParam + 1,
    getPreviousPageParam: (firstPage, allPages, firstPageParam) =>
      firstPageParam <= 1 ? undefined : firstPageParam - 1,
  })
