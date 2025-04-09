import { measureAsyncFunction } from 'reassure'
import { mockDatabase } from 'test/utils'
import { collection } from '../../schema'

describe('updateCollection', () => {
  test.each([
    {
      name: 'when updating a collection',
      fixture: {
        collection: {
          name: 'Collection Name',
        },
      },
      input: {
        name: 'New Collection Name',
      },
    },
  ])('$name', async ({ fixture, input }) => {
    const { database, resetDatabaseMock } = await mockDatabase()
    const { default: updateCollection } = await import('./updateCollection')

    const [{ id }] = await database
      .insert(collection)
      .values(fixture.collection)
      .returning()

    await measureAsyncFunction(
      async () => await updateCollection({ id, ...input }),
    )

    resetDatabaseMock()
  })
})
