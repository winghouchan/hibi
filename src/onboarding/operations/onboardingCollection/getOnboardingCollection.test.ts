import { mockDatabase } from 'test/utils'

describe('getOnboardingCollection', () => {
  test.each([
    {
      name: 'when there are no collections, returns `null`',
      fixture: {},
      expected: null,
    },
    {
      name: 'when there is 1 collection with no notes, returns the collection and empty array of notes',
      fixture: {
        collection: {
          name: 'Collection Name',
          notes: [],
        },
      },
      expected: expect.objectContaining({
        id: expect.any(Number),
        name: 'Collection Name',
        notes: [],
      }),
    },
    {
      name: 'when there is 1 collection with at least 1 note, returns the collection and its notes',
      fixture: {
        collection: {
          name: 'Collection Name',
          notes: [
            {
              fields: [[{ value: 'Front' }], [{ value: 'Back' }]],
              config: {
                reversible: false,
                separable: false,
              },
            },
          ],
        },
      },
      expected: expect.objectContaining({
        id: expect.any(Number),
        name: 'Collection Name',
        notes: [
          {
            id: expect.any(Number),
            reversible: false,
            separable: false,
            createdAt: expect.any(Date),
            fields: expect.arrayContaining([
              expect.objectContaining({ value: 'Front' }),
              expect.objectContaining({ value: 'Back' }),
            ]),
          },
        ],
      }),
    },
  ])('$name', async ({ fixture, expected }) => {
    const { resetDatabaseMock } = await mockDatabase()
    const { default: getOnboardingCollection } = await import(
      './getOnboardingCollection'
    )
    const { createCollection } = await import('@/collections/operations')
    const { createNote } = await import('@/notes/operations')

    if (fixture.collection) {
      const { notes, ...collection } = fixture.collection

      const { id: collectionId } = await createCollection(collection)

      await Promise.all(
        notes.map((note) =>
          createNote({ collections: [collectionId], ...note }),
        ),
      )
    }

    const result = await getOnboardingCollection()

    expect(result).toEqual(expected)

    resetDatabaseMock()
  })
})
