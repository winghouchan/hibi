import { measureAsyncFunction } from 'reassure'
import { collection } from '@/collections/schema'
import { mockDatabase } from 'test/utils'

describe('updateNote', () => {
  test.each([
    {
      name: 'when updating a note',
      fixture: {
        collection: {
          name: 'Collection Name',
        },
        note: {
          fields: [
            [{ type: 'text/plain', value: 'Front' }],
            [{ type: 'text/plain', value: 'Back' }],
          ],
          config: { reversible: false, separable: false },
        },
      },
      input: {
        fields: [
          [{ type: 'text/plain', value: 'New Front' }],
          [{ type: 'text/plain', value: 'New Back' }],
        ],
        config: { reversible: true, separable: true },
      },
    },
  ])('$name', async ({ fixture, input }) => {
    const { database, resetDatabaseMock } = await mockDatabase()
    const { createNote } = await import('../createNote')
    const { default: updateNote } = await import('./updateNote')

    const [{ id: collectionId }] = await database
      .insert(collection)
      .values(fixture.collection)
      .returning()

    const { id: noteId } = await createNote({
      collections: [collectionId],
      ...fixture.note,
    })

    await measureAsyncFunction(
      async () => await updateNote({ id: noteId, ...input }),
    )

    resetDatabaseMock()
  })
})
