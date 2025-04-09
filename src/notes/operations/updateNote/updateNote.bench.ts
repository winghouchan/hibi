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
          fields: [[{ value: 'Front' }], [{ value: 'Back' }]],
          config: { reversible: false, separable: false },
        },
      },
      input: {
        fields: [[{ value: 'New Front' }], [{ value: 'New Back' }]],
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
