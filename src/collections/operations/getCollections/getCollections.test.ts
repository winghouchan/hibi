import { mockDatabase } from 'test/utils'
import { collection } from '../../schema'

describe('getCollections', () => {
  test.each([
    {
      name: 'when given a single ID and a collection with the given ID does not exist, returns an empty array',
      fixture: {},
      input: {
        id: [1],
      },
      expected: [],
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
        id: [1],
      },
      expected: [
        expect.objectContaining({
          id: 1,
          name: 'Matching Collection',
          createdAt: expect.any(Date),
        }),
      ],
    },
    {
      name: 'when given a multiple IDs and no collections for all the given IDs exist, returns an empty array',
      fixture: {},
      input: {
        id: [1, 2],
      },
      expected: [],
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
        id: [1, 3],
      },
      expected: [
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
    {
      name: 'when given a multiple IDs and a collection exists for some given IDs, returns the collections',
      fixture: {
        collections: [
          { id: 1, name: 'Matching Collection' },
          { id: 2, name: 'Not Matching Collection' },
        ],
      },
      input: {
        id: [1, 4],
      },
      expected: [
        expect.objectContaining({
          id: 1,
          name: 'Matching Collection',
          createdAt: expect.any(Date),
        }),
      ],
    },
  ])('$name', async ({ expected, fixture, input }) => {
    const { database, resetDatabaseMock } = await mockDatabase()
    const { default: getCollections } = await import('./getCollections')

    if (fixture?.collections) {
      await database.insert(collection).values(fixture.collections)
    }

    const output = await getCollections({ filter: input })

    expect(output).toEqual(expected)

    resetDatabaseMock()
  })
})
