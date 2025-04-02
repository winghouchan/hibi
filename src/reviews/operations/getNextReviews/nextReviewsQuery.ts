import { infiniteQueryOptions } from '@tanstack/react-query'
import getNextReviews from './getNextReviews'

export default (options: Parameters<typeof getNextReviews>[0]) =>
  infiniteQueryOptions({
    queryKey: ['review', options],
    queryFn: async () => await getNextReviews(options),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages, lastPageParam) =>
      lastPage === null ? undefined : lastPageParam + 1,
    getPreviousPageParam: (firstPage, allPages, firstPageParam) =>
      firstPageParam <= 1 ? undefined : firstPageParam - 1,
    select: (data) =>
      data.pages.reduce<
        ((typeof data.pages)[number]['reviewables'][number] | null)[]
      >(
        (accumulator, page) =>
          page?.reviewables.length > 0
            ? [...accumulator, ...page.reviewables]
            : [...accumulator, null],
        [],
      ),
  })
