import { measureAsyncFunction } from 'reassure'
import { mockDatabase } from 'test/utils'
import { Collection, collection } from '../../schema'

describe('getCollections', () => {
  test.each([
    {
      name: 'when searching for a collection that does not exist and there are 0 collections',
      fixture: {
        collections: 0,
      },
      variable: {
        collectionExists: false,
      },
    },
    {
      name: 'when searching for a collection that does not exist and there is 1 collection',
      fixture: {
        collections: 1,
      },
      variable: {
        collectionExists: false,
      },
    },
    {
      name: 'when searching for a collection that does not exist and there are 10 collections',
      fixture: {
        collections: 10,
      },
      variable: {
        collectionExists: false,
      },
    },
    {
      name: 'when searching for a collection that does not exist and there are 100 collections',
      fixture: {
        collections: 100,
      },
      variable: {
        collectionExists: false,
      },
    },
    {
      name: 'when searching for a collection that does not exist and there are 1000 collections',
      fixture: {
        collections: 1000,
      },
      variable: {
        collectionExists: false,
      },
    },
    {
      name: 'when searching for a collection that exists and there is 1 collection',
      fixture: {
        collections: 1,
      },
      variable: {
        collectionExists: true,
      },
    },
    {
      name: 'when searching for a collection that exists and there are 10 collections',
      fixture: {
        collections: 10,
      },
      variable: {
        collectionExists: true,
      },
    },
    {
      name: 'when searching for a collection that exists and there are 100 collections',
      fixture: {
        collections: 100,
      },
      variable: {
        collectionExists: true,
      },
    },
    {
      name: 'when searching for a collection that exists and there are 1000 collections',
      fixture: {
        collections: 1000,
      },
      variable: {
        collectionExists: true,
      },
    },
  ])('$name', async ({ fixture, variable }) => {
    const { database, resetDatabaseMock } = await mockDatabase()
    const { default: getCollections } = await import('./getCollections')
    const input = { filter: { id: [0] } } satisfies Parameters<
      typeof getCollections
    >[0]
    let data: Collection[]

    if (fixture.collections) {
      data = await database
        .insert(collection)
        .values(
          Array.from({ length: fixture.collections }, () => ({
            name: 'Collection',
          })),
        )
        .returning()
    }

    await measureAsyncFunction(async () => {
      input.filter.id = [
        variable.collectionExists
          ? data?.[Math.floor(Math.random() * data.length)].id
          : 0,
      ]

      await getCollections(input)
    })

    resetDatabaseMock()
  })
})
