import { measureAsyncFunction } from 'reassure'
import { collection } from '@/collections/schema'
import { mockDatabase } from 'test/utils'

describe('createNote', () => {
  test.each([
    {
      name: 'when creating a note',
      fixture: {
        collection: {
          name: 'Collection Name',
        },
      },
      input: {
        fields: [
          [{ type: 'text/plain', value: 'Front' }],
          [{ type: 'text/plain', value: 'Back' }],
        ],
        config: {
          reversible: true,
          separable: true,
        },
      },
    },
  ])('$name', async ({ fixture, input }) => {
    const { database, resetDatabaseMock } = await mockDatabase()
    const { default: createNote } = await import('./createNote')

    const [{ id: collectionId }] = await database
      .insert(collection)
      .values(fixture.collection)
      .returning()

    await measureAsyncFunction(
      async () => await createNote({ collections: [collectionId], ...input }),
    )

    resetDatabaseMock()
  })
})
