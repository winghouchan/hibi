import { useInfiniteQuery } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-native'
import { mockAppRoot } from 'test/utils'
import collectionsQuery from './collectionsQuery'
import getCollections from './getCollections'

jest.mock('./getCollections')

describe('collectionsQuery', () => {
  test.each([
    {
      name: 'when given no filters, does not skip the query',
      input: undefined,
      skipped: false,
    },
    {
      name: 'when given undefined filters, does not skip the query',
      input: {
        filter: undefined,
      },
      skipped: false,
    },
    {
      name: 'when given a filter with a single value, does not skip the query',
      input: {
        filter: {
          id: [1],
        },
      },
      skipped: false,
    },
    {
      name: 'when given a filter with a multiple values, does not skip the query',
      input: {
        filter: {
          id: [1, 2],
        },
      },
      skipped: false,
    },
    {
      name: 'when given a filter with a defined value and an undefined value, does not skip the query',
      input: {
        filter: {
          id: [1],
          name: undefined,
        },
      },
      skipped: false,
    },
    {
      name: 'when given a filter with an undefined value, skips the query',
      input: {
        filter: {
          id: undefined,
        },
      },
      skipped: true,
    },
    {
      name: 'when given a filter with an empty array, skips the query',
      input: {
        filter: {
          id: [],
        },
      },
      skipped: true,
    },
    {
      name: 'when given a filter with an empty array and an undefined value, skips the query',
      input: {
        filter: {
          id: [],
          name: undefined,
        },
      },
      skipped: true,
    },
  ])('$name', async ({ input, skipped }) => {
    renderHook(() => useInfiniteQuery(collectionsQuery(input)), {
      wrapper: mockAppRoot(),
    })

    expect(getCollections).toHaveBeenCalledTimes(skipped ? 0 : 1)
  })
})
