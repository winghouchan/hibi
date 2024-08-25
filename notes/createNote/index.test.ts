import { mockDatabase } from '@/test/utils'

function generateFieldMocks(length: number) {
  return Array.from({ length }, (_, index) => ({
    value: `Field Mock ${index}`,
  }))
}

const expectedCollection = [
  expect.objectContaining({
    id: 1,
  }),
]

describe('createNote', () => {
  test.each([
    /**
     * 2 fields
     */
    {
      config: { reversible: false, reviewFieldsSeparately: false },
      fields: generateFieldMocks(2),
      expected: {
        collections: expectedCollection,
        fields: [
          expect.objectContaining({
            id: 1,
            note: 1,
            position: 0,
          }),
          expect.objectContaining({
            id: 2,
            note: 1,
            position: 1,
          }),
        ],
        reviewables: [
          expect.objectContaining({
            id: 1,
            note: 1,
            fields: [
              expect.objectContaining({
                reviewable: 1,
                field: 1,
              }),
              expect.objectContaining({
                reviewable: 1,
                field: 2,
              }),
            ],
          }),
        ],
      },
    },
    {
      config: { reversible: true, reviewFieldsSeparately: false },
      fields: generateFieldMocks(2),
      expected: {
        collections: expectedCollection,
        fields: [
          expect.objectContaining({
            id: 1,
            note: 1,
            position: 0,
          }),
          expect.objectContaining({
            id: 2,
            note: 1,
            position: 1,
          }),
        ],
        reviewables: [
          expect.objectContaining({
            id: 1,
            note: 1,
            fields: [
              expect.objectContaining({
                reviewable: 1,
                field: 1,
              }),
              expect.objectContaining({
                reviewable: 1,
                field: 2,
              }),
            ],
          }),
          expect.objectContaining({
            id: 2,
            note: 1,
            fields: [
              expect.objectContaining({
                reviewable: 2,
                field: 2,
              }),
              expect.objectContaining({
                reviewable: 2,
                field: 1,
              }),
            ],
          }),
        ],
      },
    },
    {
      config: { reversible: false, reviewFieldsSeparately: true },
      fields: generateFieldMocks(2),
      expected: {
        collections: expectedCollection,
        fields: [
          expect.objectContaining({
            id: 1,
            note: 1,
            position: 0,
          }),
          expect.objectContaining({
            id: 2,
            note: 1,
            position: 1,
          }),
        ],
        reviewables: [
          expect.objectContaining({
            id: 1,
            note: 1,
            fields: [
              expect.objectContaining({
                reviewable: 1,
                field: 1,
              }),
              expect.objectContaining({
                reviewable: 1,
                field: 2,
              }),
            ],
          }),
        ],
      },
    },
    {
      config: { reversible: true, reviewFieldsSeparately: true },
      fields: generateFieldMocks(2),
      expected: {
        collections: expectedCollection,
        fields: [
          expect.objectContaining({
            id: 1,
            note: 1,
            position: 0,
          }),
          expect.objectContaining({
            id: 2,
            note: 1,
            position: 1,
          }),
        ],
        reviewables: [
          expect.objectContaining({
            id: 1,
            note: 1,
            fields: [
              expect.objectContaining({
                reviewable: 1,
                field: 1,
              }),
              expect.objectContaining({
                reviewable: 1,
                field: 2,
              }),
            ],
          }),
          expect.objectContaining({
            id: 2,
            note: 1,
            fields: [
              expect.objectContaining({
                reviewable: 2,
                field: 2,
              }),
              expect.objectContaining({
                reviewable: 2,
                field: 1,
              }),
            ],
          }),
        ],
      },
    },
    /**
     * 3 fields
     */
    {
      config: { reversible: false, reviewFieldsSeparately: false },
      fields: generateFieldMocks(3),
      expected: {
        collections: expectedCollection,
        fields: [
          expect.objectContaining({
            id: 1,
            note: 1,
            position: 0,
          }),
          expect.objectContaining({
            id: 2,
            note: 1,
            position: 1,
          }),
          expect.objectContaining({
            id: 3,
            note: 1,
            position: 2,
          }),
        ],
        reviewables: [
          expect.objectContaining({
            id: 1,
            note: 1,
            fields: [
              expect.objectContaining({
                reviewable: 1,
                field: 1,
              }),
              expect.objectContaining({
                reviewable: 1,
                field: 2,
              }),
              expect.objectContaining({
                reviewable: 1,
                field: 3,
              }),
            ],
          }),
        ],
      },
    },
    {
      config: { reversible: true, reviewFieldsSeparately: false },
      fields: generateFieldMocks(3),
      expected: {
        collections: expectedCollection,
        fields: [
          expect.objectContaining({
            id: 1,
            note: 1,
            position: 0,
          }),
          expect.objectContaining({
            id: 2,
            note: 1,
            position: 1,
          }),
          expect.objectContaining({
            id: 3,
            note: 1,
            position: 2,
          }),
        ],
        reviewables: [
          expect.objectContaining({
            id: 1,
            note: 1,
            fields: [
              expect.objectContaining({
                reviewable: 1,
                field: 1,
              }),
              expect.objectContaining({
                reviewable: 1,
                field: 2,
              }),
              expect.objectContaining({
                reviewable: 1,
                field: 3,
              }),
            ],
          }),
          expect.objectContaining({
            id: 2,
            note: 1,
            fields: [
              expect.objectContaining({
                reviewable: 2,
                field: 2,
              }),
              expect.objectContaining({
                reviewable: 2,
                field: 3,
              }),
              expect.objectContaining({
                reviewable: 2,
                field: 1,
              }),
            ],
          }),
        ],
      },
    },
    {
      config: { reversible: false, reviewFieldsSeparately: true },
      fields: generateFieldMocks(3),
      expected: {
        collections: expectedCollection,
        fields: [
          expect.objectContaining({
            id: 1,
            note: 1,
            position: 0,
          }),
          expect.objectContaining({
            id: 2,
            note: 1,
            position: 1,
          }),
          expect.objectContaining({
            id: 3,
            note: 1,
            position: 2,
          }),
        ],
        reviewables: [
          expect.objectContaining({
            id: 1,
            note: 1,
            fields: [
              expect.objectContaining({
                reviewable: 1,
                field: 1,
              }),
              expect.objectContaining({
                reviewable: 1,
                field: 2,
              }),
            ],
          }),
          expect.objectContaining({
            id: 2,
            note: 1,
            fields: [
              expect.objectContaining({
                reviewable: 2,
                field: 1,
              }),
              expect.objectContaining({
                reviewable: 2,
                field: 3,
              }),
            ],
          }),
        ],
      },
    },
    {
      config: { reversible: true, reviewFieldsSeparately: true },
      fields: generateFieldMocks(3),
      expected: {
        collections: expectedCollection,
        fields: [
          expect.objectContaining({
            id: 1,
            note: 1,
            position: 0,
          }),
          expect.objectContaining({
            id: 2,
            note: 1,
            position: 1,
          }),
          expect.objectContaining({
            id: 3,
            note: 1,
            position: 2,
          }),
        ],
        reviewables: [
          expect.objectContaining({
            id: 1,
            note: 1,
            fields: [
              expect.objectContaining({
                reviewable: 1,
                field: 1,
              }),
              expect.objectContaining({
                reviewable: 1,
                field: 2,
              }),
            ],
          }),
          expect.objectContaining({
            id: 2,
            note: 1,
            fields: [
              expect.objectContaining({
                reviewable: 2,
                field: 1,
              }),
              expect.objectContaining({
                reviewable: 2,
                field: 3,
              }),
            ],
          }),
          expect.objectContaining({
            id: 3,
            note: 1,
            fields: [
              expect.objectContaining({
                reviewable: 3,
                field: 2,
              }),
              expect.objectContaining({
                reviewable: 3,
                field: 1,
              }),
            ],
          }),
          expect.objectContaining({
            id: 4,
            note: 1,
            fields: [
              expect.objectContaining({
                reviewable: 4,
                field: 2,
              }),
              expect.objectContaining({
                reviewable: 4,
                field: 3,
              }),
            ],
          }),
          expect.objectContaining({
            id: 5,
            note: 1,
            fields: [
              expect.objectContaining({
                reviewable: 5,
                field: 3,
              }),
              expect.objectContaining({
                reviewable: 5,
                field: 1,
              }),
            ],
          }),
          expect.objectContaining({
            id: 6,
            note: 1,
            fields: [
              expect.objectContaining({
                reviewable: 6,
                field: 3,
              }),
              expect.objectContaining({
                reviewable: 6,
                field: 2,
              }),
            ],
          }),
        ],
      },
    },
    /**
     * 4 fields
     */
    {
      config: { reversible: false, reviewFieldsSeparately: false },
      fields: generateFieldMocks(4),
      expected: {
        collections: expectedCollection,
        fields: [
          expect.objectContaining({
            id: 1,
            note: 1,
            position: 0,
          }),
          expect.objectContaining({
            id: 2,
            note: 1,
            position: 1,
          }),
          expect.objectContaining({
            id: 3,
            note: 1,
            position: 2,
          }),
          expect.objectContaining({
            id: 4,
            note: 1,
            position: 3,
          }),
        ],
        reviewables: [
          expect.objectContaining({
            id: 1,
            note: 1,
            fields: [
              expect.objectContaining({
                reviewable: 1,
                field: 1,
              }),
              expect.objectContaining({
                reviewable: 1,
                field: 2,
              }),
              expect.objectContaining({
                reviewable: 1,
                field: 3,
              }),
              expect.objectContaining({
                reviewable: 1,
                field: 4,
              }),
            ],
          }),
        ],
      },
    },
    {
      config: { reversible: true, reviewFieldsSeparately: false },
      fields: generateFieldMocks(4),
      expected: {
        collections: expectedCollection,
        fields: [
          expect.objectContaining({
            id: 1,
            note: 1,
            position: 0,
          }),
          expect.objectContaining({
            id: 2,
            note: 1,
            position: 1,
          }),
          expect.objectContaining({
            id: 3,
            note: 1,
            position: 2,
          }),
          expect.objectContaining({
            id: 4,
            note: 1,
            position: 3,
          }),
        ],
        reviewables: [
          expect.objectContaining({
            id: 1,
            note: 1,
            fields: [
              expect.objectContaining({
                reviewable: 1,
                field: 1,
              }),
              expect.objectContaining({
                reviewable: 1,
                field: 2,
              }),
              expect.objectContaining({
                reviewable: 1,
                field: 3,
              }),
              expect.objectContaining({
                reviewable: 1,
                field: 4,
              }),
            ],
          }),
          expect.objectContaining({
            id: 2,
            note: 1,
            fields: [
              expect.objectContaining({
                reviewable: 2,
                field: 2,
              }),
              expect.objectContaining({
                reviewable: 2,
                field: 3,
              }),
              expect.objectContaining({
                reviewable: 2,
                field: 4,
              }),
              expect.objectContaining({
                reviewable: 2,
                field: 1,
              }),
            ],
          }),
        ],
      },
    },
    {
      config: { reversible: false, reviewFieldsSeparately: true },
      fields: generateFieldMocks(4),
      expected: {
        collections: expectedCollection,
        fields: [
          expect.objectContaining({
            id: 1,
            note: 1,
            position: 0,
          }),
          expect.objectContaining({
            id: 2,
            note: 1,
            position: 1,
          }),
          expect.objectContaining({
            id: 3,
            note: 1,
            position: 2,
          }),
          expect.objectContaining({
            id: 4,
            note: 1,
            position: 3,
          }),
        ],
        reviewables: [
          expect.objectContaining({
            id: 1,
            note: 1,
            fields: [
              expect.objectContaining({
                reviewable: 1,
                field: 1,
              }),
              expect.objectContaining({
                reviewable: 1,
                field: 2,
              }),
            ],
          }),
          expect.objectContaining({
            id: 2,
            note: 1,
            fields: [
              expect.objectContaining({
                reviewable: 2,
                field: 1,
              }),
              expect.objectContaining({
                reviewable: 2,
                field: 3,
              }),
            ],
          }),
          expect.objectContaining({
            id: 3,
            note: 1,
            fields: [
              expect.objectContaining({
                reviewable: 3,
                field: 1,
              }),
              expect.objectContaining({
                reviewable: 3,
                field: 4,
              }),
            ],
          }),
        ],
      },
    },
    {
      config: { reversible: true, reviewFieldsSeparately: true },
      fields: generateFieldMocks(4),
      expected: {
        collections: expectedCollection,
        fields: [
          expect.objectContaining({
            id: 1,
            note: 1,
            position: 0,
          }),
          expect.objectContaining({
            id: 2,
            note: 1,
            position: 1,
          }),
          expect.objectContaining({
            id: 3,
            note: 1,
            position: 2,
          }),
          expect.objectContaining({
            id: 4,
            note: 1,
            position: 3,
          }),
        ],
        reviewables: [
          expect.objectContaining({
            id: 1,
            note: 1,
            fields: [
              expect.objectContaining({
                reviewable: 1,
                field: 1,
              }),
              expect.objectContaining({
                reviewable: 1,
                field: 2,
              }),
            ],
          }),
          expect.objectContaining({
            id: 2,
            note: 1,
            fields: [
              expect.objectContaining({
                reviewable: 2,
                field: 1,
              }),
              expect.objectContaining({
                reviewable: 2,
                field: 3,
              }),
            ],
          }),
          expect.objectContaining({
            id: 3,
            note: 1,
            fields: [
              expect.objectContaining({
                reviewable: 3,
                field: 1,
              }),
              expect.objectContaining({
                reviewable: 3,
                field: 4,
              }),
            ],
          }),
          expect.objectContaining({
            id: 4,
            note: 1,
            fields: [
              expect.objectContaining({
                reviewable: 4,
                field: 2,
              }),
              expect.objectContaining({
                reviewable: 4,
                field: 1,
              }),
            ],
          }),
          expect.objectContaining({
            id: 5,
            note: 1,
            fields: [
              expect.objectContaining({
                reviewable: 5,
                field: 2,
              }),
              expect.objectContaining({
                reviewable: 5,
                field: 3,
              }),
            ],
          }),
          expect.objectContaining({
            id: 6,
            note: 1,
            fields: [
              expect.objectContaining({
                reviewable: 6,
                field: 2,
              }),
              expect.objectContaining({
                reviewable: 6,
                field: 4,
              }),
            ],
          }),
          expect.objectContaining({
            id: 7,
            note: 1,
            fields: [
              expect.objectContaining({
                reviewable: 7,
                field: 3,
              }),
              expect.objectContaining({
                reviewable: 7,
                field: 1,
              }),
            ],
          }),
          expect.objectContaining({
            id: 8,
            note: 1,
            fields: [
              expect.objectContaining({
                reviewable: 8,
                field: 3,
              }),
              expect.objectContaining({
                reviewable: 8,
                field: 2,
              }),
            ],
          }),
          expect.objectContaining({
            id: 9,
            note: 1,
            fields: [
              expect.objectContaining({
                reviewable: 9,
                field: 3,
              }),
              expect.objectContaining({
                reviewable: 9,
                field: 4,
              }),
            ],
          }),
          expect.objectContaining({
            id: 10,
            note: 1,
            fields: [
              expect.objectContaining({
                reviewable: 10,
                field: 4,
              }),
              expect.objectContaining({
                reviewable: 10,
                field: 1,
              }),
            ],
          }),
          expect.objectContaining({
            id: 11,
            note: 1,
            fields: [
              expect.objectContaining({
                reviewable: 11,
                field: 4,
              }),
              expect.objectContaining({
                reviewable: 11,
                field: 2,
              }),
            ],
          }),
          expect.objectContaining({
            id: 12,
            note: 1,
            fields: [
              expect.objectContaining({
                reviewable: 12,
                field: 4,
              }),
              expect.objectContaining({
                reviewable: 12,
                field: 3,
              }),
            ],
          }),
        ],
      },
    },
  ])(
    'given $fields.length fields, reversible: $config.reversible, reviewFieldsSeparately: $config.reviewFieldsSeparately, correctly creates notes and reviewables',
    async ({ config, fields, expected }) => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const { createCollection } = await import('@/collections')
      const { default: createNote } = await import('.')
      const collectionMock = await createCollection({ name: 'Collection Mock' })
      const input = {
        config,
        note: {
          collections: [collectionMock.id],
          fields,
        },
      }

      const returnedState = await createNote(input)
      const queriedState = await database.query.note.findMany({
        with: {
          collections: {
            columns: {},
            with: {
              collection: true,
            },
          },
          fields: true,
          reviewables: {
            with: {
              fields: true,
            },
          },
        },
      })

      expect(queriedState).toHaveLength(1)
      expect(
        queriedState[0].collections.map(({ collection }) => collection),
      ).toEqual(expected.collections)
      expect(queriedState[0].fields).toEqual(
        expect.arrayContaining(expected.fields),
      )
      expect(queriedState[0].reviewables).toEqual(expected.reviewables)

      expect(returnedState.collections).toEqual(expected.collections)
      expect(returnedState.fields).toEqual(expected.fields)
      expect(returnedState.reviewables).toEqual(expected.reviewables)

      resetDatabaseMock()
    },
  )

  it('auto-increments the note ID', async () => {
    const { database, resetDatabaseMock } = await mockDatabase()
    const { createCollection } = await import('@/collections')
    const { default: createNote } = await import('.')
    const collectionMock = await createCollection({ name: 'Collection Mock' })
    const input = {
      config: {
        reversible: false,
        reviewFieldsSeparately: false,
      },
      note: {
        collections: [collectionMock.id],
        fields: [{ value: 'Value Mock' }, { value: 'Value Mock' }],
      },
    }

    await createNote(input)
    await createNote(input)
    const output = await database.query.note.findMany()

    expect(output).toEqual([
      expect.objectContaining({ id: 1 }),
      expect.objectContaining({ id: 2 }),
    ])

    resetDatabaseMock()
  })

  it('when no fields are provided, does not create a note', async () => {
    const { resetDatabaseMock } = await mockDatabase()
    const { createCollection } = await import('@/collections')
    const { default: createNote } = await import('.')
    const collectionMock = await createCollection({ name: 'Collection Mock' })
    const input = {
      config: {
        reversible: false,
        reviewFieldsSeparately: false,
      },
      note: {
        collections: [collectionMock.id],
        fields: [],
      },
    }

    await expect(async () => await createNote(input)).rejects.toThrow()

    resetDatabaseMock()
  })

  it('when less than two fields are provided, does not create a note', async () => {
    const { resetDatabaseMock } = await mockDatabase()
    const { createCollection } = await import('@/collections')
    const { default: createNote } = await import('.')
    const collectionMock = await createCollection({ name: 'Collection Mock' })
    const input = {
      config: {
        reversible: false,
        reviewFieldsSeparately: false,
      },
      note: {
        collections: [collectionMock.id],
        fields: [{ value: 'Value Mock' }],
      },
    }

    await expect(async () => await createNote(input)).rejects.toThrow()

    resetDatabaseMock()
  })

  it('when a field with a value of an empty string is provided, does not create a note', async () => {
    const { resetDatabaseMock } = await mockDatabase()
    const { createCollection } = await import('@/collections')
    const { default: createNote } = await import('.')
    const collectionMock = await createCollection({ name: 'Collection Mock' })
    const input = {
      config: {
        reversible: false,
        reviewFieldsSeparately: false,
      },
      note: {
        collections: [collectionMock.id],
        fields: [{ value: '' }, { value: '' }],
      },
    }

    await expect(async () => await createNote(input)).rejects.toEqual(
      expect.objectContaining({
        message: expect.stringContaining(
          'CHECK constraint failed: length(`value`) > 0',
        ),
      }),
    )

    resetDatabaseMock()
  })

  it('when no collection is provided, does not create a note', async () => {
    const { resetDatabaseMock } = await mockDatabase()
    const { default: createNote } = await import('.')
    const input = {
      config: {
        reversible: false,
        reviewFieldsSeparately: false,
      },
      note: {
        collections: [],
        fields: [{ value: 'Value Mock' }, { value: 'Value Mock' }],
      },
    }

    await expect(async () => await createNote(input)).rejects.toThrow()

    resetDatabaseMock()
  })

  it('when a non-existent collection is provided, does not create a note', async () => {
    const { resetDatabaseMock } = await mockDatabase()
    const { default: createNote } = await import('.')
    const nonExistentCollectionId = 0
    const input = {
      config: {
        reversible: false,
        reviewFieldsSeparately: false,
      },
      note: {
        collections: [nonExistentCollectionId],
        fields: [{ value: 'Value Mock' }, { value: 'Value Mock' }],
      },
    }

    await expect(async () => await createNote(input)).rejects.toEqual(
      expect.objectContaining({
        message: expect.stringContaining('FOREIGN KEY constraint failed'),
      }),
    )

    resetDatabaseMock()
  })
})
