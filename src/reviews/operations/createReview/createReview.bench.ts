import { measureAsyncFunction } from 'reassure'
import { Grades, Rating } from 'ts-fsrs'
import { mockDatabase } from 'test/utils'

describe('createReview', () => {
  test.each([
    {
      name: 'when creating a review',
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
        rating: Grades[Rating.Again],
        duration: 2000,
      },
    },
  ])('$name', async ({ fixture, input }) => {
    const { resetDatabaseMock } = await mockDatabase()
    const { createCollection } = await import('@/collections/operations')
    const { createNote } = await import('@/notes/operations')
    const { default: createReview } = await import('./createReview')

    const collection = await createCollection(fixture.collection)
    const note = await createNote({
      collections: [collection.id],
      ...fixture.note,
    })

    await measureAsyncFunction(
      async () =>
        await createReview({
          reviewable: note.reviewables[0].id,
          ...input,
        }),
    )

    resetDatabaseMock()
  })
})
