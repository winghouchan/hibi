import { mockDatabase } from 'test/utils'
import { collection } from '../../schema'

describe('getCollection', () => {
  test.each([
    {
      name: 'when given an ID filter and a collection with the same ID exists, returns the collection with the same ID',
      fixture: {
        collections: [
          {
            id: 1,
            name: 'Collection Name',
          },
        ],
      },
      input: {
        id: 1,
      },
      expected: expect.objectContaining({
        id: 1,
        name: 'Collection Name',
        createdAt: expect.any(Date),
      }),
    },
    {
      name: 'when given an ID filter and a collection with the same ID does not exist, returns `null`',
      fixture: {},
      input: {
        id: 1,
      },
      expected: null,
    },
    {
      name: 'when given a name filter and a collection with the same name exists, returns the collection with the same name',
      fixture: {
        collections: [
          {
            id: 1,
            name: 'Collection Name',
          },
        ],
      },
      input: {
        name: 'Collection Name',
      },
      expected: expect.objectContaining({
        id: expect.any(Number),
        name: 'Collection Name',
        createdAt: expect.any(Date),
      }),
    },
    {
      name: 'when given a name filter and a collection with the same name does not exist, returns `null`',
      fixture: {},
      input: {
        name: 'Collection Name',
      },
      expected: null,
    },
    {
      name: 'when given a name and ID filter and a collection with the same name and ID exists, returns the collection with the same name and ID',
      fixture: {
        collections: [
          { id: 1, name: 'Potential Match' },
          { id: 2, name: 'Potential Match' },
          { id: 3, name: 'A collection' },
        ],
      },
      input: {
        id: 2,
        name: 'Potential Match',
      },
      expected: expect.objectContaining({
        id: 2,
        name: 'Potential Match',
      }),
    },
    {
      name: 'when given a name and ID filter and a collection with the same name and ID does not exist, returns `null`',
      fixture: {
        collections: [{ id: 1, name: 'Potential Match' }],
      },
      input: {
        id: 0,
        name: 'Potential Match',
      },
      expected: null,
    },
  ])('$name', async ({ expected, fixture, input }) => {
    const { database, resetDatabaseMock } = await mockDatabase()
    const { default: getCollection } = await import('./getCollection')

    if (fixture?.collections) {
      await database.insert(collection).values(fixture.collections)
    }

    const output = await getCollection({ filter: input })

    expect(output).toEqual(expected)

    resetDatabaseMock()
  })
})
