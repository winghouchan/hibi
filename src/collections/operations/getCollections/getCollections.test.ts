import { mockDatabase } from 'test/utils'
import { collection } from '../../schema'

describe('getCollections', () => {
  test.each([
    {
      name: 'when given no filters and no collections exist, returns an empty array',
      fixture: {},
      input: undefined,
      expected: {
        cursor: { next: undefined },
        collections: [],
      },
    },
    {
      name: 'when given no filters and some collections exist, returns all collections up to the default pagination limit',
      fixture: {
        collections: [
          { id: 1, name: 'Collection Name' },
          { id: 2, name: 'Collection Name' },
          { id: 3, name: 'Collection Name' },
          { id: 4, name: 'Collection Name' },
          { id: 5, name: 'Collection Name' },
          { id: 6, name: 'Collection Name' },
          { id: 7, name: 'Collection Name' },
          { id: 8, name: 'Collection Name' },
          { id: 9, name: 'Collection Name' },
          { id: 10, name: 'Collection Name' },
          { id: 11, name: 'Collection Name' },
        ],
      },
      input: undefined,
      expected: {
        cursor: {
          next: 11,
        },
        collections: [
          expect.objectContaining({
            id: 1,
            name: 'Collection Name',
            createdAt: expect.any(Date),
          }),
          expect.objectContaining({
            id: 2,
            name: 'Collection Name',
            createdAt: expect.any(Date),
          }),
          expect.objectContaining({
            id: 3,
            name: 'Collection Name',
            createdAt: expect.any(Date),
          }),
          expect.objectContaining({
            id: 4,
            name: 'Collection Name',
            createdAt: expect.any(Date),
          }),
          expect.objectContaining({
            id: 5,
            name: 'Collection Name',
            createdAt: expect.any(Date),
          }),
          expect.objectContaining({
            id: 6,
            name: 'Collection Name',
            createdAt: expect.any(Date),
          }),
          expect.objectContaining({
            id: 7,
            name: 'Collection Name',
            createdAt: expect.any(Date),
          }),
          expect.objectContaining({
            id: 8,
            name: 'Collection Name',
            createdAt: expect.any(Date),
          }),
          expect.objectContaining({
            id: 9,
            name: 'Collection Name',
            createdAt: expect.any(Date),
          }),
          expect.objectContaining({
            id: 10,
            name: 'Collection Name',
            createdAt: expect.any(Date),
          }),
        ],
      },
    },
    {
      name: 'when given a single ID and a collection with the given ID does not exist, returns an empty array',
      fixture: {},
      input: {
        filter: {
          id: [1],
        },
      },
      expected: {
        cursor: { next: undefined },
        collections: [],
      },
    },
    {
      name: 'when given a single ID and a collection with the given ID exists, returns the matching collection',
      fixture: {
        collections: [
          { id: 1, name: 'Matching Collection' },
          { id: 2, name: 'Not Matching Collection' },
        ],
      },
      input: {
        filter: {
          id: [1],
        },
      },
      expected: {
        cursor: { next: undefined },
        collections: [
          expect.objectContaining({
            id: 1,
            name: 'Matching Collection',
            createdAt: expect.any(Date),
          }),
        ],
      },
    },
    {
      name: 'when given a multiple IDs and no collections for all the given IDs exist, returns an empty array',
      fixture: {},
      input: {
        filter: {
          id: [1, 2],
        },
      },
      expected: {
        cursor: { next: undefined },
        collections: [],
      },
    },
    {
      name: 'when given a multiple IDs and a collection exists for all given IDs, returns the collections',
      fixture: {
        collections: [
          { id: 1, name: 'Matching Collection' },
          { id: 2, name: 'Not Matching Collection' },
          { id: 3, name: 'Matching Collection' },
        ],
      },
      input: {
        filter: {
          id: [1, 3],
        },
      },
      expected: {
        cursor: { next: undefined },
        collections: [
          expect.objectContaining({
            id: 1,
            name: 'Matching Collection',
            createdAt: expect.any(Date),
          }),
          expect.objectContaining({
            id: 3,
            name: 'Matching Collection',
            createdAt: expect.any(Date),
          }),
        ],
      },
    },
    {
      name: 'when given a multiple IDs and a collection exists for some given IDs, returns the collections',
      fixture: {
        collections: [
          { id: 1, name: 'Matching Collection' },
          { id: 2, name: 'Not Matching Collection' },
        ],
      },
      input: {
        filter: {
          id: [1, 4],
        },
      },
      expected: {
        cursor: { next: undefined },
        collections: [
          expect.objectContaining({
            id: 1,
            name: 'Matching Collection',
            createdAt: expect.any(Date),
          }),
        ],
      },
    },
    {
      name: 'when given an option to order by ID ascending, returns the collections ordered by ID ascending',
      fixture: {
        collections: [
          { id: 1, name: 'Collection Name' },
          { id: 2, name: 'Collection Name' },
        ],
      },
      input: {
        order: {
          id: 'asc' as const,
        },
      },
      expected: {
        cursor: {
          next: undefined,
        },
        collections: [
          expect.objectContaining({
            id: 1,
            name: 'Collection Name',
            createdAt: expect.any(Date),
          }),
          expect.objectContaining({
            id: 2,
            name: 'Collection Name',
            createdAt: expect.any(Date),
          }),
        ],
      },
    },
    {
      name: 'when given an option to order by ID descending, returns the collections ordered by ID descending',
      fixture: {
        collections: [
          { id: 1, name: 'Collection Name' },
          { id: 2, name: 'Collection Name' },
        ],
      },
      input: {
        order: {
          id: 'desc' as const,
        },
      },
      expected: {
        cursor: {
          next: undefined,
        },
        collections: [
          expect.objectContaining({
            id: 2,
            name: 'Collection Name',
            createdAt: expect.any(Date),
          }),
          expect.objectContaining({
            id: 1,
            name: 'Collection Name',
            createdAt: expect.any(Date),
          }),
        ],
      },
    },
    {
      name: 'when given a pagination limit and there are more collections than the limit, returns an amount of collections up to the limit',
      fixture: {
        collections: [
          { id: 1, name: 'Collection Name' },
          { id: 2, name: 'Collection Name' },
        ],
      },
      input: {
        pagination: {
          limit: 1,
        },
      },
      expected: {
        cursor: {
          next: 2,
        },
        collections: [
          expect.objectContaining({
            id: 1,
            name: 'Collection Name',
            createdAt: expect.any(Date),
          }),
        ],
      },
    },
    {
      name: 'when given a pagination cursor, returns collections after the cursor',
      fixture: {
        collections: [
          { id: 1, name: 'Collection Name' },
          { id: 2, name: 'Collection Name' },
        ],
      },
      input: {
        pagination: {
          cursor: 2,
        },
      },
      expected: {
        cursor: {
          next: undefined,
        },
        collections: [
          expect.objectContaining({
            id: 2,
            name: 'Collection Name',
            createdAt: expect.any(Date),
          }),
        ],
      },
    },
    {
      name: 'when given a pagination cursor and an option to order by ID descending, returns collections before the cursor',
      fixture: {
        collections: [
          { id: 1, name: 'Collection Name' },
          { id: 2, name: 'Collection Name' },
        ],
      },
      input: {
        order: {
          id: 'desc' as const,
        },
        pagination: {
          cursor: 1,
        },
      },
      expected: {
        cursor: {
          next: undefined,
        },
        collections: [
          expect.objectContaining({
            id: 1,
            name: 'Collection Name',
            createdAt: expect.any(Date),
          }),
        ],
      },
    },
    {
      name: 'when given a pagination limit and an option to order by ID ascending, returns the correct cursor',
      fixture: {
        collections: [
          { id: 1, name: 'Collection Name' },
          { id: 2, name: 'Collection Name' },
        ],
      },
      input: {
        order: {
          id: 'asc' as const,
        },
        pagination: {
          limit: 1,
        },
      },
      expected: expect.objectContaining({
        cursor: {
          next: 2,
        },
      }),
    },
    {
      name: 'when given a pagination limit and an option to order by ID descending, returns the correct cursor',
      fixture: {
        collections: [
          { id: 1, name: 'Collection Name' },
          { id: 2, name: 'Collection Name' },
        ],
      },
      input: {
        order: {
          id: 'desc' as const,
        },
        pagination: {
          limit: 1,
        },
      },
      expected: expect.objectContaining({
        cursor: {
          next: 1,
        },
      }),
    },
  ])('$name', async ({ expected, fixture, input }) => {
    const { database, resetDatabaseMock } = await mockDatabase()
    const { default: getCollections } = await import('./getCollections')

    if (fixture?.collections) {
      await database.insert(collection).values(fixture.collections)
    }

    const output = await getCollections(input)

    expect(output).toEqual(expected)

    resetDatabaseMock()
  })
})
