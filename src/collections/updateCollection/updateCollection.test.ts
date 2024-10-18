import { mockDatabase } from 'test/utils'
import { collection } from '../schema'
import { Collection } from './updateCollection'

describe('updateCollection', () => {
  test.each([
    {
      name: 'when the collection ID references a non-existent collection, does not alter the database state',
      input: { id: -1, name: 'Non Existent Collection' },
      expected: {
        databaseState: [],
        output: undefined,
      },
    },
    {
      name: 'when the collection name is an empty string, throws an error and does not alter the database state',
      fixture: [{ name: 'Existing Collection Name' }],
      input: { name: '' },
      expected: {
        databaseState: [
          {
            id: expect.any(Number),
            name: 'Existing Collection Name',
            createdAt: expect.any(Date),
          },
        ],
        output: expect.objectContaining({
          message: expect.stringContaining('CHECK constraint failed: name'),
        }),
      },
    },
    {
      name: 'when the collection name is a non-empty string, updates the collection name and returns the updated collection',
      fixture: [{ name: 'Existing Collection Name' }],
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
      fixture: [
        { name: 'Existing Collection Name To Update' },
        { name: 'Existing Collection Name' },
      ],
      input: { name: 'New Collection Name' },
      expected: {
        databaseState: [
          {
            id: expect.any(Number),
            name: 'New Collection Name',
            createdAt: expect.any(Date),
          },
          {
            id: expect.any(Number),
            name: 'Existing Collection Name',
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
    const { default: updateCollection } = await import('./updateCollection')
    const fixtureData =
      fixture && (await database.insert(collection).values(fixture).returning())
    const collectionToUpdate = fixtureData?.[0]

    const output = await updateCollection({
      id: collectionToUpdate?.id,
      ...input,
      // Cast as `Collection` as `id` will be defined when `fixture` is defined
    } as Collection).catch((error) => error)
    const databaseState = await database.query.collection.findMany()

    expect(output).toEqual(expected.output)
    expect(databaseState).toEqual(expected.databaseState)

    resetDatabaseMock()
  })
})
