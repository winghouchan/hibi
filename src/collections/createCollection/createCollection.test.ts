import { mockDatabase } from 'test/utils'
import { collection } from '../schema'

describe('createCollection', () => {
  test.each([
    {
      name: 'when the collection name is an empty string, throws an error and does not alter the database state',
      input: { name: '' },
      expected: {
        databaseState: [],
        output: expect.objectContaining({
          message: expect.stringContaining('CHECK constraint failed: name'),
        }),
      },
    },
    {
      name: 'when the collection name is a non-empty string, creates a collection with the given name and returns the created collection',
      input: { name: 'New Collection Name' },
      expected: {
        databaseState: [
          {
            id: expect.any(Number),
            name: 'New Collection Name',
            createdAt: expect.any(Date),
          },
        ],
        output: {
          id: expect.any(Number),
          name: 'New Collection Name',
          createdAt: expect.any(Date),
        },
      },
    },
    {
      name: 'when other collections exist, does not alter other collections',
      fixture: { name: 'Existing Collection Name' },
      input: { name: 'New Collection Name' },
      expected: {
        databaseState: [
          {
            id: expect.any(Number),
            name: 'Existing Collection Name',
            createdAt: expect.any(Date),
          },
          {
            id: expect.any(Number),
            name: 'New Collection Name',
            createdAt: expect.any(Date),
          },
        ],
        output: {
          id: expect.any(Number),
          name: 'New Collection Name',
          createdAt: expect.any(Date),
        },
      },
    },
  ])('$name', async ({ fixture, input, expected }) => {
    const { database, resetDatabaseMock } = await mockDatabase()
    const { default: createCollection } = await import('./createCollection')

    if (fixture) {
      await database.insert(collection).values(fixture)
    }

    const output = await createCollection(input).catch((error) => error)
    const databaseState = await database.query.collection.findMany()

    expect(output).toEqual(expected.output)
    expect(databaseState).toEqual(expected.databaseState)

    resetDatabaseMock()
  })
})
