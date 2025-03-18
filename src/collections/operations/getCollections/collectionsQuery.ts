import { infiniteQueryOptions, skipToken } from '@tanstack/react-query'
import baseQueryKey from '../baseQueryKey'
import getCollections from './getCollections'

export default function collectionsQuery(
  ...args: Parameters<typeof getCollections>
) {
  const [{ filter = undefined } = {}] = args

  return infiniteQueryOptions({
    queryKey: [baseQueryKey, 'list', ...args],
    queryFn: filter
      ? Object.values(filter).some(
          (value) => Array.isArray(value) && value.length > 0,
        )
        ? ({ pageParam }) =>
            getCollections({
              ...args[0],
              pagination: { ...args[0]?.pagination, cursor: pageParam },
            })
        : skipToken
      : ({ pageParam }) =>
          getCollections({
            ...args[0],
            pagination: { ...args[0]?.pagination, cursor: pageParam },
          }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.cursor.next,
    select: (data) =>
      data.pages.reduce<(typeof data.pages)[number]['collections']>(
        (accumulator, { collections }) => [...accumulator, ...collections],
        [],
      ),
  })
}
