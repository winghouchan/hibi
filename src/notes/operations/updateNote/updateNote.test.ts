import { eq } from 'drizzle-orm'
import { collection, collectionToNote } from '@/collections/schema'
import { mockDatabase } from 'test/utils'
import { note } from '../../schema'

describe('updateNote', () => {
  test.each([
    {
      name: 'when the note ID references a non-existent note, throws an error and does not alter the database state',
      input: { id: -1, collections: [1] },
      expected: {
        output: expect.objectContaining({
          message: expect.stringContaining('Note -1 not found'),
        }),
      },
    },
    {
      name: 'when an empty list of collection IDs is provided, throws an error and does not alter the database state',
      input: { collections: [] },
      expected: {
        output: expect.objectContaining({
          message: expect.stringContaining('at least 1 collection is required'),
        }),
      },
    },
    {
      name: 'when a collection ID references a non-existent collection, throws an error and does not alter the database state',
      input: { collections: [-1] },
      expected: {
        output: expect.objectContaining({
          cause: expect.objectContaining({
            message: expect.stringContaining('FOREIGN KEY constraint failed'),
          }),
        }),
      },
    },
    {
      name: 'when an empty list of fields is provided, throws an error and does not alter the database state',
      input: { id: 1, fields: [] },
      expected: {
        output: expect.objectContaining({
          message: expect.stringContaining('2 sides are required'),
        }),
      },
    },
    {
      name: 'when less than two sides are provided, throws an error and does not alter the database state',
      input: { id: 1, fields: [[{ value: 'Front 1' }]] },
      expected: {
        output: expect.objectContaining({
          message: expect.stringContaining('2 sides are required'),
        }),
      },
    },
    {
      name: 'when all sides have no fields, throws an error and does not alter the database state',
      input: { id: 1, fields: [[], []] },
      expected: {
        output: expect.objectContaining({
          message: expect.stringContaining(
            'every side requires at least 1 field',
          ),
        }),
      },
    },
    {
      name: 'when a side has no fields, throws an error and does not alter the database state',
      input: { id: 1, fields: [[{ value: 'Front 1' }], []] },
      expected: {
        output: expect.objectContaining({
          message: expect.stringContaining(
            'every side requires at least 1 field',
          ),
        }),
      },
    },
    {
      name: 'when a field value is an empty string, throws an error and does not alter the database state',
      input: { id: 1, fields: [[{ value: '' }], [{ value: 'Back 1' }]] },
      expected: {
        output: expect.objectContaining({
          cause: expect.objectContaining({
            message: expect.stringContaining('CHECK constraint failed'),
          }),
        }),
      },
    },
  ])('$name', async ({ input, expected }) => {
    const { database, resetDatabaseMock } = await mockDatabase()
    const { createNote } = await import('../createNote')
    const { default: updateNote } = await import('./updateNote')
    const [{ collectionId }] = await database
      .insert(collection)
      .values({ name: 'Collection Name' })
      .returning({ collectionId: collection.id })
    const { id: noteId } = await createNote({
      collections: [collectionId],
      fields: [[{ value: '1' }], [{ value: '2' }]],
      config: { reversible: false, separable: false },
    })
    const getDatabaseState = async () =>
      await database.query.note.findMany({
        with: {
          collections: true,
          fields: true,
          reviewables: true,
        },
      })

    const precedingDatabaseState = await getDatabaseState()
    const output = await updateNote({ id: noteId, ...input }).catch(
      (error) => error,
    )
    const succeedingDatabaseState = await getDatabaseState()

    expect(output).toEqual(expected.output)
    expect(succeedingDatabaseState).toEqual(precedingDatabaseState)

    resetDatabaseMock()
  })

  describe('when the list of collections provided', () => {
    test.each([
      {
        name: 'includes a new collection, adds the note to the collection',
        fixture: {
          collections: ['Collection 1', 'Collection 2'],
          note: { collections: [0] },
        },
        input: { collections: [0, 1] },
        expected: [
          {
            id: expect.any(Number),
            name: 'Collection 1',
            createdAt: expect.any(Date),
          },
          {
            id: expect.any(Number),
            name: 'Collection 2',
            createdAt: expect.any(Date),
          },
        ],
      },
      {
        name: 'excludes a collection the note was in, removes the note from that collection',
        fixture: {
          collections: ['Collection 1', 'Collection 2'],
          note: { collections: [0, 1] },
        },
        input: { collections: [0] },
        expected: [
          {
            id: expect.any(Number),
            name: 'Collection 1',
            createdAt: expect.any(Date),
          },
        ],
      },
      {
        name: 'includes new collections and excludes collections the note was in, moves the note to the new collections',
        fixture: {
          collections: ['Collection 1', 'Collection 2'],
          note: { collections: [0] },
        },
        input: { collections: [1] },
        expected: [
          {
            id: expect.any(Number),
            name: 'Collection 2',
            createdAt: expect.any(Date),
          },
        ],
      },
    ])('$name', async ({ fixture, input, expected }) => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const { default: updateNote } = await import('./updateNote')
      const collections = await database
        .insert(collection)
        .values(fixture.collections.map((name) => ({ name })))
        .returning({ id: collection.id })
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      await database.insert(collectionToNote).values(
        fixture.note.collections.map((collection) => ({
          collection: collections[collection].id,
          note: noteId,
        })),
      )

      const output = await updateNote({
        id: noteId,
        collections: input.collections.map(
          (collection) => collections[collection].id,
        ),
      })
      const databaseState = (
        await database.query.note.findMany({
          with: {
            collections: {
              with: {
                collection: true,
              },
            },
          },
        })
      ).map((note) => ({
        ...note,
        collections: note.collections.map(({ collection }) => collection),
      }))

      expect(output).toEqual(expect.objectContaining({ collections: expected }))
      expect(databaseState).toEqual([
        expect.objectContaining({ collections: expected }),
      ])

      resetDatabaseMock()
    })
  })

  describe('when the list of fields provided', () => {
    test.each([
      {
        name: 'replaces a single field on the first side, the correct state is produced and returned',
        fixture: {
          note: {
            fields: [[{ value: '1' }], [{ value: '2' }]],
            config: { reversible: false, separable: false },
          },
        },
        input: { fields: [[{ value: '1a' }], [{ value: '2' }]] },
        expected: {
          output: expect.objectContaining({
            fields: [
              expect.objectContaining({
                value: '2',
                side: 1,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '1a',
                side: 0,
                position: 0,
                archived: false,
              }),
            ],
          }),
          databaseState: [
            expect.objectContaining({
              fields: [
                expect.objectContaining({
                  value: '1',
                  side: 0,
                  position: 0,
                  archived: true,
                }),
                expect.objectContaining({
                  value: '2',
                  side: 1,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '1a',
                  side: 0,
                  position: 0,
                  archived: false,
                }),
              ],
              reviewables: [
                expect.objectContaining({
                  archived: true,
                  fields: [
                    expect.objectContaining({
                      reviewable: 1,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 2,
                      side: 1,
                    }),
                  ],
                }),
                expect.objectContaining({
                  archived: false,
                  fields: [
                    expect.objectContaining({
                      reviewable: 2,
                      field: 2,
                      side: 1,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 3,
                      side: 0,
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      },
      {
        name: 'replaces a single field on the second side, the correct state is produced and returned',
        fixture: {
          note: {
            fields: [[{ value: '1' }], [{ value: '2' }]],
            config: { reversible: false, separable: false },
          },
        },
        input: { fields: [[{ value: '1' }], [{ value: '2a' }]] },
        expected: {
          output: expect.objectContaining({
            fields: [
              expect.objectContaining({
                value: '1',
                side: 0,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '2a',
                side: 1,
                position: 0,
                archived: false,
              }),
            ],
          }),
          databaseState: [
            expect.objectContaining({
              fields: [
                expect.objectContaining({
                  value: '1',
                  side: 0,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2',
                  side: 1,
                  position: 0,
                  archived: true,
                }),
                expect.objectContaining({
                  value: '2a',
                  side: 1,
                  position: 0,
                  archived: false,
                }),
              ],
              reviewables: [
                expect.objectContaining({
                  archived: true,
                  fields: [
                    expect.objectContaining({
                      reviewable: 1,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 2,
                      side: 1,
                    }),
                  ],
                }),
                expect.objectContaining({
                  archived: false,
                  fields: [
                    expect.objectContaining({
                      reviewable: 2,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 3,
                      side: 1,
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      },
      {
        name: 'replaces multiple fields on the first side, the correct state is produced and returned',
        fixture: {
          note: {
            fields: [[{ value: '1a' }, { value: '1b' }], [{ value: '2' }]],
            config: { reversible: false, separable: false },
          },
        },
        input: {
          fields: [[{ value: '1A' }, { value: '1B' }], [{ value: '2' }]],
        },
        expected: {
          output: expect.objectContaining({
            fields: [
              expect.objectContaining({
                value: '2',
                side: 1,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '1A',
                side: 0,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '1B',
                side: 0,
                position: 1,
                archived: false,
              }),
            ],
          }),
          databaseState: [
            expect.objectContaining({
              fields: [
                expect.objectContaining({
                  value: '1a',
                  side: 0,
                  position: 0,
                  archived: true,
                }),
                expect.objectContaining({
                  value: '1b',
                  side: 0,
                  position: 1,
                  archived: true,
                }),
                expect.objectContaining({
                  value: '2',
                  side: 1,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '1A',
                  side: 0,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '1B',
                  side: 0,
                  position: 1,
                  archived: false,
                }),
              ],
              reviewables: [
                expect.objectContaining({
                  archived: true,
                  fields: [
                    expect.objectContaining({
                      reviewable: 1,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 2,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 3,
                      side: 1,
                    }),
                  ],
                }),
                expect.objectContaining({
                  archived: false,
                  fields: [
                    expect.objectContaining({
                      reviewable: 2,
                      field: 3,
                      side: 1,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 4,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 5,
                      side: 0,
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      },
      {
        name: 'replaces multiple fields on the second side, the correct state is produced and returned',
        fixture: {
          note: {
            fields: [[{ value: '1' }], [{ value: '2a' }, { value: '2b' }]],
            config: { reversible: false, separable: false },
          },
        },
        input: {
          fields: [[{ value: '1' }], [{ value: '2A' }, { value: '2B' }]],
        },
        expected: {
          output: expect.objectContaining({
            fields: [
              expect.objectContaining({
                value: '1',
                side: 0,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '2A',
                side: 1,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '2B',
                side: 1,
                position: 1,
                archived: false,
              }),
            ],
          }),
          databaseState: [
            expect.objectContaining({
              fields: [
                expect.objectContaining({
                  value: '1',
                  side: 0,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2a',
                  side: 1,
                  position: 0,
                  archived: true,
                }),
                expect.objectContaining({
                  value: '2b',
                  side: 1,
                  position: 1,
                  archived: true,
                }),
                expect.objectContaining({
                  value: '2A',
                  side: 1,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2B',
                  side: 1,
                  position: 1,
                  archived: false,
                }),
              ],
              reviewables: [
                expect.objectContaining({
                  archived: true,
                  fields: [
                    expect.objectContaining({
                      reviewable: 1,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 2,
                      side: 1,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 3,
                      side: 1,
                    }),
                  ],
                }),
                expect.objectContaining({
                  archived: false,
                  fields: [
                    expect.objectContaining({
                      reviewable: 2,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 4,
                      side: 1,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 5,
                      side: 1,
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      },
      {
        name: 'prepends a note field on the first side, the correct state is produced and returned',
        fixture: {
          note: {
            fields: [[{ value: '1' }], [{ value: '2' }]],
            config: { reversible: false, separable: false },
          },
        },
        input: {
          fields: [[{ value: 'a' }, { value: '1' }], [{ value: '2' }]],
        },
        expected: {
          output: expect.objectContaining({
            fields: [
              expect.objectContaining({
                value: '1',
                side: 0,
                position: 1,
                archived: false,
              }),
              expect.objectContaining({
                value: '2',
                side: 1,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: 'a',
                side: 0,
                position: 0,
                archived: false,
              }),
            ],
          }),
          databaseState: [
            expect.objectContaining({
              fields: [
                expect.objectContaining({
                  value: '1',
                  side: 0,
                  position: 1,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2',
                  side: 1,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: 'a',
                  side: 0,
                  position: 0,
                  archived: false,
                }),
              ],
              reviewables: [
                expect.objectContaining({
                  archived: true,
                  fields: [
                    expect.objectContaining({
                      reviewable: 1,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 2,
                      side: 1,
                    }),
                  ],
                }),
                expect.objectContaining({
                  archived: false,
                  fields: [
                    expect.objectContaining({
                      reviewable: 2,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 2,
                      side: 1,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 3,
                      side: 0,
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      },
      {
        name: 'prepends a note field on the first side with a value of an existing note field, the correct state is produced and returned',
        fixture: {
          note: {
            fields: [[{ value: '1' }], [{ value: '2' }]],
            config: { reversible: false, separable: false },
          },
        },
        input: {
          fields: [[{ value: '2' }, { value: '1' }], [{ value: '2' }]],
        },
        expected: {
          output: expect.objectContaining({
            fields: [
              expect.objectContaining({
                value: '1',
                side: 0,
                position: 1,
                archived: false,
              }),
              expect.objectContaining({
                value: '2',
                side: 0,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '2',
                side: 1,
                position: 0,
                archived: false,
              }),
            ],
          }),
          databaseState: [
            expect.objectContaining({
              fields: [
                expect.objectContaining({
                  value: '1',
                  side: 0,
                  position: 1,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2',
                  side: 0,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2',
                  side: 1,
                  position: 0,
                  archived: false,
                }),
              ],
              reviewables: [
                expect.objectContaining({
                  archived: true,
                  fields: [
                    expect.objectContaining({
                      reviewable: 1,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 2,
                      side: 1,
                    }),
                  ],
                }),
                expect.objectContaining({
                  archived: false,
                  fields: [
                    expect.objectContaining({
                      reviewable: 2,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 2,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 3,
                      side: 1,
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      },
      {
        name: 'prepends a note field on the second side, the correct state is produced and returned',
        fixture: {
          note: {
            fields: [[{ value: '1' }], [{ value: '2' }]],
            config: { reversible: false, separable: false },
          },
        },
        input: {
          fields: [[{ value: '1' }], [{ value: 'a' }, { value: '2' }]],
        },
        expected: {
          output: expect.objectContaining({
            fields: [
              expect.objectContaining({
                value: '1',
                side: 0,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '2',
                side: 1,
                position: 1,
                archived: false,
              }),
              expect.objectContaining({
                value: 'a',
                side: 1,
                position: 0,
                archived: false,
              }),
            ],
          }),
          databaseState: [
            expect.objectContaining({
              fields: [
                expect.objectContaining({
                  value: '1',
                  side: 0,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2',
                  side: 1,
                  position: 1,
                  archived: false,
                }),
                expect.objectContaining({
                  value: 'a',
                  side: 1,
                  position: 0,
                  archived: false,
                }),
              ],
              reviewables: [
                expect.objectContaining({
                  archived: true,
                  fields: [
                    expect.objectContaining({
                      reviewable: 1,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 2,
                      side: 1,
                    }),
                  ],
                }),
                expect.objectContaining({
                  archived: false,
                  fields: [
                    expect.objectContaining({
                      reviewable: 2,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 2,
                      side: 1,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 3,
                      side: 1,
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      },
      {
        name: 'prepends a note field on the second side with a value of an existing note field, the correct state is produced and returned',
        fixture: {
          note: {
            fields: [[{ value: '1' }], [{ value: '2' }]],
            config: { reversible: false, separable: false },
          },
        },
        input: {
          fields: [[{ value: '1' }], [{ value: '1' }, { value: '2' }]],
        },
        expected: {
          output: expect.objectContaining({
            fields: [
              expect.objectContaining({
                value: '1',
                side: 0,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '2',
                side: 1,
                position: 1,
                archived: false,
              }),
              expect.objectContaining({
                value: '1',
                side: 1,
                position: 0,
                archived: false,
              }),
            ],
          }),
          databaseState: [
            expect.objectContaining({
              fields: [
                expect.objectContaining({
                  value: '1',
                  side: 0,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2',
                  side: 1,
                  position: 1,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '1',
                  side: 1,
                  position: 0,
                  archived: false,
                }),
              ],
              reviewables: [
                expect.objectContaining({
                  archived: true,
                  fields: [
                    expect.objectContaining({
                      reviewable: 1,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 2,
                      side: 1,
                    }),
                  ],
                }),
                expect.objectContaining({
                  archived: false,
                  fields: [
                    expect.objectContaining({
                      reviewable: 2,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 2,
                      side: 1,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 3,
                      side: 1,
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      },
      {
        name: 'appends a note field on the first side, the correct state is produced and returned',
        fixture: {
          note: {
            fields: [[{ value: '1a' }], [{ value: '2a' }]],
            config: { reversible: false, separable: false },
          },
        },
        input: {
          fields: [[{ value: '1a' }, { value: '1b' }], [{ value: '2a' }]],
        },
        expected: {
          output: expect.objectContaining({
            fields: [
              expect.objectContaining({
                value: '1a',
                side: 0,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '2a',
                side: 1,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '1b',
                side: 0,
                position: 1,
                archived: false,
              }),
            ],
          }),
          databaseState: [
            expect.objectContaining({
              fields: [
                expect.objectContaining({
                  value: '1a',
                  side: 0,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2a',
                  side: 1,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '1b',
                  side: 0,
                  position: 1,
                  archived: false,
                }),
              ],
              reviewables: [
                expect.objectContaining({
                  archived: true,
                  fields: [
                    expect.objectContaining({
                      reviewable: 1,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 2,
                      side: 1,
                    }),
                  ],
                }),
                expect.objectContaining({
                  archived: false,
                  fields: [
                    expect.objectContaining({
                      reviewable: 2,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 2,
                      side: 1,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 3,
                      side: 0,
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      },
      {
        name: 'appends a note field on the second side, the correct state is produced and returned',
        fixture: {
          note: {
            fields: [[{ value: '1a' }], [{ value: '2a' }]],
            config: { reversible: false, separable: false },
          },
        },
        input: {
          fields: [[{ value: '1a' }], [{ value: '2a' }, { value: '2b' }]],
        },
        expected: {
          output: expect.objectContaining({
            fields: [
              expect.objectContaining({
                value: '1a',
                side: 0,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '2a',
                side: 1,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '2b',
                side: 1,
                position: 1,
                archived: false,
              }),
            ],
          }),
          databaseState: [
            expect.objectContaining({
              fields: [
                expect.objectContaining({
                  value: '1a',
                  side: 0,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2a',
                  side: 1,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2b',
                  side: 1,
                  position: 1,
                  archived: false,
                }),
              ],
              reviewables: [
                expect.objectContaining({
                  archived: true,
                  fields: [
                    expect.objectContaining({
                      reviewable: 1,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 2,
                      side: 1,
                    }),
                  ],
                }),
                expect.objectContaining({
                  archived: false,
                  fields: [
                    expect.objectContaining({
                      reviewable: 2,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 2,
                      side: 1,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 3,
                      side: 1,
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      },
      {
        name: 'appends a note field on the first side with a value of an existing note field, the correct state is produced and returned',
        fixture: {
          note: {
            fields: [[{ value: '1' }], [{ value: '2' }]],
            config: { reversible: false, separable: false },
          },
        },
        input: {
          fields: [[{ value: '1' }, { value: '1' }], [{ value: '2' }]],
        },
        expected: {
          output: expect.objectContaining({
            fields: [
              expect.objectContaining({
                value: '1',
                side: 0,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '2',
                side: 1,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '1',
                side: 0,
                position: 1,
                archived: false,
              }),
            ],
          }),
          databaseState: [
            expect.objectContaining({
              fields: [
                expect.objectContaining({
                  value: '1',
                  side: 0,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2',
                  side: 1,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '1',
                  side: 0,
                  position: 1,
                  archived: false,
                }),
              ],
              reviewables: [
                expect.objectContaining({
                  archived: true,
                  fields: [
                    expect.objectContaining({
                      reviewable: 1,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 2,
                      side: 1,
                    }),
                  ],
                }),
                expect.objectContaining({
                  archived: false,
                  fields: [
                    expect.objectContaining({
                      reviewable: 2,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 2,
                      side: 1,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 3,
                      side: 0,
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      },
      {
        name: 'appends a note field on the second side with a value  of an existing note field, the correct state is produced and returned',
        fixture: {
          note: {
            fields: [[{ value: '1' }], [{ value: '2' }]],
            config: { reversible: false, separable: false },
          },
        },
        input: {
          fields: [[{ value: '1' }], [{ value: '2' }, { value: '2' }]],
        },
        expected: {
          output: expect.objectContaining({
            fields: [
              expect.objectContaining({
                value: '1',
                side: 0,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '2',
                side: 1,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '2',
                side: 1,
                position: 1,
                archived: false,
              }),
            ],
          }),
          databaseState: [
            expect.objectContaining({
              fields: [
                expect.objectContaining({
                  value: '1',
                  side: 0,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2',
                  side: 1,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2',
                  side: 1,
                  position: 1,
                  archived: false,
                }),
              ],
              reviewables: [
                expect.objectContaining({
                  archived: true,
                  fields: [
                    expect.objectContaining({
                      reviewable: 1,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 2,
                      side: 1,
                    }),
                  ],
                }),
                expect.objectContaining({
                  archived: false,
                  fields: [
                    expect.objectContaining({
                      reviewable: 2,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 2,
                      side: 1,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 3,
                      side: 1,
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      },
      {
        name: 'removes the first note field on the first side, the correct state is produced and returned',
        fixture: {
          note: {
            fields: [[{ value: '1a' }, { value: '1b' }], [{ value: '2a' }]],
            config: { reversible: false, separable: false },
          },
        },
        input: {
          fields: [[{ value: '1b' }], [{ value: '2a' }]],
        },
        expected: {
          output: expect.objectContaining({
            fields: [
              expect.objectContaining({
                value: '1b',
                side: 0,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '2a',
                side: 1,
                position: 0,
                archived: false,
              }),
            ],
          }),
          databaseState: [
            expect.objectContaining({
              fields: [
                expect.objectContaining({
                  value: '1a',
                  side: 0,
                  position: 0,
                  archived: true,
                }),
                expect.objectContaining({
                  value: '1b',
                  side: 0,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2a',
                  side: 1,
                  position: 0,
                  archived: false,
                }),
              ],
              reviewables: [
                expect.objectContaining({
                  archived: true,
                  fields: [
                    expect.objectContaining({
                      reviewable: 1,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 2,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 3,
                      side: 1,
                    }),
                  ],
                }),
                expect.objectContaining({
                  archived: false,
                  fields: [
                    expect.objectContaining({
                      reviewable: 2,
                      field: 2,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 3,
                      side: 1,
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      },
      {
        name: 'removes the first note field on the second side, the correct state is produced and returned',
        fixture: {
          note: {
            fields: [[{ value: '1a' }], [{ value: '2a' }, { value: '2b' }]],
            config: { reversible: false, separable: false },
          },
        },
        input: {
          fields: [[{ value: '1a' }], [{ value: '2b' }]],
        },
        expected: {
          output: expect.objectContaining({
            fields: [
              expect.objectContaining({
                value: '1a',
                side: 0,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '2b',
                side: 1,
                position: 0,
                archived: false,
              }),
            ],
          }),
          databaseState: [
            expect.objectContaining({
              fields: [
                expect.objectContaining({
                  value: '1a',
                  side: 0,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2a',
                  side: 1,
                  position: 0,
                  archived: true,
                }),
                expect.objectContaining({
                  value: '2b',
                  side: 1,
                  position: 0,
                  archived: false,
                }),
              ],
              reviewables: [
                expect.objectContaining({
                  archived: true,
                  fields: [
                    expect.objectContaining({
                      reviewable: 1,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 2,
                      side: 1,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 3,
                      side: 1,
                    }),
                  ],
                }),
                expect.objectContaining({
                  archived: false,
                  fields: [
                    expect.objectContaining({
                      reviewable: 2,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 3,
                      side: 1,
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      },
      {
        name: 'removes the last note field on the first side, the correct state is produced and returned',
        fixture: {
          note: {
            fields: [[{ value: '1a' }, { value: '1b' }], [{ value: '2a' }]],
            config: { reversible: false, separable: false },
          },
        },
        input: {
          fields: [[{ value: '1a' }], [{ value: '2a' }]],
        },
        expected: {
          output: expect.objectContaining({
            fields: [
              expect.objectContaining({
                value: '1a',
                side: 0,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '2a',
                side: 1,
                position: 0,
                archived: false,
              }),
            ],
          }),
          databaseState: [
            expect.objectContaining({
              fields: [
                expect.objectContaining({
                  value: '1a',
                  side: 0,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '1b',
                  side: 0,
                  position: 1,
                  archived: true,
                }),
                expect.objectContaining({
                  value: '2a',
                  side: 1,
                  position: 0,
                  archived: false,
                }),
              ],
              reviewables: [
                expect.objectContaining({
                  archived: true,
                  fields: [
                    expect.objectContaining({
                      reviewable: 1,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 2,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 3,
                      side: 1,
                    }),
                  ],
                }),
                expect.objectContaining({
                  archived: false,
                  fields: [
                    expect.objectContaining({
                      reviewable: 2,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 3,
                      side: 1,
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      },
      {
        name: 'removes the last note field on the second side, the correct state is produced and returned',
        fixture: {
          note: {
            fields: [[{ value: '1a' }], [{ value: '2a' }, { value: '2b' }]],
            config: { reversible: false, separable: false },
          },
        },
        input: {
          fields: [[{ value: '1a' }], [{ value: '2a' }]],
        },
        expected: {
          output: expect.objectContaining({
            fields: [
              expect.objectContaining({
                value: '1a',
                side: 0,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '2a',
                side: 1,
                position: 0,
                archived: false,
              }),
            ],
          }),
          databaseState: [
            expect.objectContaining({
              fields: [
                expect.objectContaining({
                  value: '1a',
                  side: 0,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2a',
                  side: 1,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2b',
                  side: 1,
                  position: 1,
                  archived: true,
                }),
              ],
              reviewables: [
                expect.objectContaining({
                  archived: true,
                  fields: [
                    expect.objectContaining({
                      reviewable: 1,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 2,
                      side: 1,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 3,
                      side: 1,
                    }),
                  ],
                }),
                expect.objectContaining({
                  archived: false,
                  fields: [
                    expect.objectContaining({
                      reviewable: 2,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 2,
                      side: 1,
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      },
      {
        name: 'removes a note field between two fields on the first side, the correct state is produced and returned',
        fixture: {
          note: {
            fields: [
              [{ value: '1a' }, { value: '1b' }, { value: '1c' }],
              [{ value: '2a' }],
            ],
            config: { reversible: false, separable: false },
          },
        },
        input: {
          fields: [[{ value: '1a' }, { value: '1c' }], [{ value: '2a' }]],
        },
        expected: {
          output: expect.objectContaining({
            fields: [
              expect.objectContaining({
                value: '1a',
                side: 0,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '1c',
                side: 0,
                position: 1,
                archived: false,
              }),
              expect.objectContaining({
                value: '2a',
                side: 1,
                position: 0,
                archived: false,
              }),
            ],
          }),
          databaseState: [
            expect.objectContaining({
              fields: [
                expect.objectContaining({
                  value: '1a',
                  side: 0,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '1b',
                  side: 0,
                  position: 1,
                  archived: true,
                }),
                expect.objectContaining({
                  value: '1c',
                  side: 0,
                  position: 1,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2a',
                  side: 1,
                  position: 0,
                  archived: false,
                }),
              ],
              reviewables: [
                expect.objectContaining({
                  archived: true,
                  fields: [
                    expect.objectContaining({
                      reviewable: 1,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 2,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 3,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 4,
                      side: 1,
                    }),
                  ],
                }),
                expect.objectContaining({
                  archived: false,
                  fields: [
                    expect.objectContaining({
                      reviewable: 2,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 3,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 4,
                      side: 1,
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      },
      {
        name: 'removes a note field between two fields on the second side, the correct state is produced and returned',
        fixture: {
          note: {
            fields: [
              [{ value: '1a' }],
              [{ value: '2a' }, { value: '2b' }, { value: '2c' }],
            ],
            config: { reversible: false, separable: false },
          },
        },
        input: {
          fields: [[{ value: '1a' }], [{ value: '2a' }, { value: '2c' }]],
        },
        expected: {
          output: expect.objectContaining({
            fields: [
              expect.objectContaining({
                value: '1a',
                side: 0,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '2a',
                side: 1,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '2c',
                side: 1,
                position: 1,
                archived: false,
              }),
            ],
          }),
          databaseState: [
            expect.objectContaining({
              fields: [
                expect.objectContaining({
                  value: '1a',
                  side: 0,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2a',
                  side: 1,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2b',
                  side: 1,
                  position: 1,
                  archived: true,
                }),
                expect.objectContaining({
                  value: '2c',
                  side: 1,
                  position: 1,
                  archived: false,
                }),
              ],
              reviewables: [
                expect.objectContaining({
                  archived: true,
                  fields: [
                    expect.objectContaining({
                      reviewable: 1,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 2,
                      side: 1,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 3,
                      side: 1,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 4,
                      side: 1,
                    }),
                  ],
                }),
                expect.objectContaining({
                  archived: false,
                  fields: [
                    expect.objectContaining({
                      reviewable: 2,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 2,
                      side: 1,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 4,
                      side: 1,
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      },
      {
        name: 'removes a note field on the first side that has the same value as another field, the correct state is produced and returned',
        fixture: {
          note: {
            fields: [[{ value: '1' }, { value: '1' }], [{ value: '2' }]],
            config: { reversible: false, separable: false },
          },
        },
        input: {
          fields: [[{ value: '1' }], [{ value: '2' }]],
        },
        expected: {
          output: expect.objectContaining({
            fields: [
              expect.objectContaining({
                value: '1',
                side: 0,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '2',
                side: 1,
                position: 0,
                archived: false,
              }),
            ],
          }),
          databaseState: [
            expect.objectContaining({
              fields: [
                expect.objectContaining({
                  value: '1',
                  side: 0,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '1',
                  side: 0,
                  position: 1,
                  archived: true,
                }),
                expect.objectContaining({
                  value: '2',
                  side: 1,
                  position: 0,
                  archived: false,
                }),
              ],
              reviewables: [
                expect.objectContaining({
                  archived: true,
                  fields: [
                    expect.objectContaining({
                      reviewable: 1,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 2,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 3,
                      side: 1,
                    }),
                  ],
                }),
                expect.objectContaining({
                  archived: false,
                  fields: [
                    expect.objectContaining({
                      reviewable: 2,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 3,
                      side: 1,
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      },
      {
        name: 'removes a note field on the second side that has the same value as another field, the correct state is produced and returned',
        fixture: {
          note: {
            fields: [[{ value: '1' }], [{ value: '2' }, { value: '2' }]],
            config: { reversible: false, separable: false },
          },
        },
        input: {
          fields: [[{ value: '1' }], [{ value: '2' }]],
        },
        expected: {
          output: expect.objectContaining({
            fields: [
              expect.objectContaining({
                value: '1',
                side: 0,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '2',
                side: 1,
                position: 0,
                archived: false,
              }),
            ],
          }),
          databaseState: [
            expect.objectContaining({
              fields: [
                expect.objectContaining({
                  value: '1',
                  side: 0,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2',
                  side: 1,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2',
                  side: 1,
                  position: 1,
                  archived: true,
                }),
              ],
              reviewables: [
                expect.objectContaining({
                  archived: true,
                  fields: [
                    expect.objectContaining({
                      reviewable: 1,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 2,
                      side: 1,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 3,
                      side: 1,
                    }),
                  ],
                }),
                expect.objectContaining({
                  archived: false,
                  fields: [
                    expect.objectContaining({
                      reviewable: 2,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 2,
                      side: 1,
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      },
      {
        name: 'inserts a new note field between two fields on the first side, the correct state is produced and returned',
        fixture: {
          note: {
            fields: [[{ value: '1a' }, { value: '1c' }], [{ value: '2a' }]],
            config: { reversible: false, separable: false },
          },
        },
        input: {
          fields: [
            [{ value: '1a' }, { value: '1b' }, { value: '1c' }],
            [{ value: '2a' }],
          ],
        },
        expected: {
          output: expect.objectContaining({
            fields: [
              expect.objectContaining({
                value: '1a',
                side: 0,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '1c',
                side: 0,
                position: 2,
                archived: false,
              }),
              expect.objectContaining({
                value: '2a',
                side: 1,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '1b',
                side: 0,
                position: 1,
                archived: false,
              }),
            ],
          }),
          databaseState: [
            expect.objectContaining({
              fields: [
                expect.objectContaining({
                  value: '1a',
                  side: 0,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '1c',
                  side: 0,
                  position: 2,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2a',
                  side: 1,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '1b',
                  side: 0,
                  position: 1,
                  archived: false,
                }),
              ],
              reviewables: [
                expect.objectContaining({
                  archived: true,
                  fields: [
                    expect.objectContaining({
                      reviewable: 1,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 2,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 3,
                      side: 1,
                    }),
                  ],
                }),
                expect.objectContaining({
                  archived: false,
                  fields: [
                    expect.objectContaining({
                      reviewable: 2,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 2,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 3,
                      side: 1,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 4,
                      side: 0,
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      },
      {
        name: 'inserts a new note field between two fields on the second side, the correct state is produced and returned',
        fixture: {
          note: {
            fields: [[{ value: '1a' }], [{ value: '2a' }, { value: '2c' }]],
            config: { reversible: false, separable: false },
          },
        },
        input: {
          fields: [
            [{ value: '1a' }],
            [{ value: '2a' }, { value: '2b' }, { value: '2c' }],
          ],
        },
        expected: {
          output: expect.objectContaining({
            fields: [
              expect.objectContaining({
                value: '1a',
                side: 0,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '2a',
                side: 1,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '2c',
                side: 1,
                position: 2,
                archived: false,
              }),
              expect.objectContaining({
                value: '2b',
                side: 1,
                position: 1,
                archived: false,
              }),
            ],
          }),
          databaseState: [
            expect.objectContaining({
              fields: [
                expect.objectContaining({
                  value: '1a',
                  side: 0,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2a',
                  side: 1,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2c',
                  side: 1,
                  position: 2,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2b',
                  side: 1,
                  position: 1,
                  archived: false,
                }),
              ],
              reviewables: [
                expect.objectContaining({
                  archived: true,
                  fields: [
                    expect.objectContaining({
                      reviewable: 1,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 2,
                      side: 1,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 3,
                      side: 1,
                    }),
                  ],
                }),
                expect.objectContaining({
                  archived: false,
                  fields: [
                    expect.objectContaining({
                      reviewable: 2,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 2,
                      side: 1,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 3,
                      side: 1,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 4,
                      side: 1,
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      },
      {
        name: 'inserts a new note field with a value of an existing note field between two fields on the first side, the correct state is produced and returned',
        fixture: {
          note: {
            fields: [[{ value: '1' }, { value: '2' }], [{ value: '3' }]],
            config: { reversible: false, separable: false },
          },
        },
        input: {
          fields: [
            [{ value: '1' }, { value: '1' }, { value: '2' }],
            [{ value: '3' }],
          ],
        },
        expected: {
          output: expect.objectContaining({
            fields: [
              expect.objectContaining({
                value: '1',
                side: 0,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '2',
                side: 0,
                position: 2,
                archived: false,
              }),
              expect.objectContaining({
                value: '3',
                side: 1,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '1',
                side: 0,
                position: 1,
                archived: false,
              }),
            ],
          }),
          databaseState: [
            expect.objectContaining({
              fields: [
                expect.objectContaining({
                  value: '1',
                  side: 0,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2',
                  side: 0,
                  position: 2,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '3',
                  side: 1,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '1',
                  side: 0,
                  position: 1,
                  archived: false,
                }),
              ],
              reviewables: [
                expect.objectContaining({
                  archived: true,
                  fields: [
                    expect.objectContaining({
                      reviewable: 1,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 2,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 3,
                      side: 1,
                    }),
                  ],
                }),
                expect.objectContaining({
                  archived: false,
                  fields: [
                    expect.objectContaining({
                      reviewable: 2,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 2,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 3,
                      side: 1,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 4,
                      side: 0,
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      },
      {
        name: 'inserts a new note field  with a value of an existing note field between two fields on the second side, the correct state is produced and returned',
        fixture: {
          note: {
            fields: [[{ value: '1' }], [{ value: '2' }, { value: '3' }]],
            config: { reversible: false, separable: false },
          },
        },
        input: {
          fields: [
            [{ value: '1' }],
            [{ value: '2' }, { value: '2' }, { value: '3' }],
          ],
        },
        expected: {
          output: expect.objectContaining({
            fields: [
              expect.objectContaining({
                value: '1',
                side: 0,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '2',
                side: 1,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '3',
                side: 1,
                position: 2,
                archived: false,
              }),
              expect.objectContaining({
                value: '2',
                side: 1,
                position: 1,
                archived: false,
              }),
            ],
          }),
          databaseState: [
            expect.objectContaining({
              fields: [
                expect.objectContaining({
                  value: '1',
                  side: 0,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2',
                  side: 1,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '3',
                  side: 1,
                  position: 2,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2',
                  side: 1,
                  position: 1,
                  archived: false,
                }),
              ],
              reviewables: [
                expect.objectContaining({
                  archived: true,
                  fields: [
                    expect.objectContaining({
                      reviewable: 1,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 2,
                      side: 1,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 3,
                      side: 1,
                    }),
                  ],
                }),
                expect.objectContaining({
                  archived: false,
                  fields: [
                    expect.objectContaining({
                      reviewable: 2,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 2,
                      side: 1,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 3,
                      side: 1,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 4,
                      side: 1,
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      },
      {
        name: 'swaps positions of note fields on the first side, the correct state is produced and returned',
        fixture: {
          note: {
            fields: [[{ value: '1a' }, { value: '1b' }], [{ value: '2a' }]],
            config: { reversible: false, separable: false },
          },
        },
        input: {
          fields: [[{ value: '1b' }, { value: '1a' }], [{ value: '2a' }]],
        },
        expected: {
          output: expect.objectContaining({
            fields: [
              expect.objectContaining({
                value: '1a',
                side: 0,
                position: 1,
                archived: false,
              }),
              expect.objectContaining({
                value: '1b',
                side: 0,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '2a',
                side: 1,
                position: 0,
                archived: false,
              }),
            ],
          }),
          databaseState: [
            expect.objectContaining({
              fields: [
                expect.objectContaining({
                  value: '1a',
                  side: 0,
                  position: 1,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '1b',
                  side: 0,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2a',
                  side: 1,
                  position: 0,
                  archived: false,
                }),
              ],
              reviewables: [
                expect.objectContaining({
                  archived: false,
                  fields: [
                    expect.objectContaining({
                      reviewable: 1,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 2,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 3,
                      side: 1,
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      },
      {
        name: 'swaps positions of note fields on the second side, the correct state is produced and returned',
        fixture: {
          note: {
            fields: [[{ value: '1a' }], [{ value: '2a' }, { value: '2b' }]],
            config: { reversible: false, separable: false },
          },
        },
        input: {
          fields: [[{ value: '1a' }], [{ value: '2b' }, { value: '2a' }]],
        },
        expected: {
          output: expect.objectContaining({
            fields: [
              expect.objectContaining({
                value: '1a',
                side: 0,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '2a',
                side: 1,
                position: 1,
                archived: false,
              }),
              expect.objectContaining({
                value: '2b',
                side: 1,
                position: 0,
                archived: false,
              }),
            ],
          }),
          databaseState: [
            expect.objectContaining({
              fields: [
                expect.objectContaining({
                  value: '1a',
                  side: 0,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2a',
                  side: 1,
                  position: 1,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2b',
                  side: 1,
                  position: 0,
                  archived: false,
                }),
              ],
              reviewables: [
                expect.objectContaining({
                  archived: false,
                  fields: [
                    expect.objectContaining({
                      reviewable: 1,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 2,
                      side: 1,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 3,
                      side: 1,
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      },
      {
        name: 'swaps sides with a single note field each, the correct state is produced and returned',
        fixture: {
          note: {
            fields: [[{ value: '1a' }], [{ value: '2a' }]],
            config: { reversible: false, separable: false },
          },
        },
        input: {
          fields: [[{ value: '2a' }], [{ value: '1a' }]],
        },
        expected: {
          output: expect.objectContaining({
            fields: [
              expect.objectContaining({
                value: '1a',
                side: 1,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '2a',
                side: 0,
                position: 0,
                archived: false,
              }),
            ],
          }),
          databaseState: [
            expect.objectContaining({
              fields: [
                expect.objectContaining({
                  value: '1a',
                  side: 1,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2a',
                  side: 0,
                  position: 0,
                  archived: false,
                }),
              ],
              reviewables: [
                expect.objectContaining({
                  archived: true,
                  fields: [
                    expect.objectContaining({
                      reviewable: 1,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 2,
                      side: 1,
                    }),
                  ],
                }),
                expect.objectContaining({
                  archived: false,
                  fields: [
                    expect.objectContaining({
                      reviewable: 2,
                      field: 1,
                      side: 1,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 2,
                      side: 0,
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      },
      {
        name: 'swaps sides with a multiple note fields each, the correct state is produced and returned',
        fixture: {
          note: {
            fields: [
              [{ value: '1a' }, { value: '1b' }],
              [{ value: '2a' }, { value: '2b' }],
            ],
            config: { reversible: false, separable: false },
          },
        },
        input: {
          fields: [
            [{ value: '2a' }, { value: '2b' }],
            [{ value: '1a' }, { value: '1b' }],
          ],
        },
        expected: {
          output: expect.objectContaining({
            fields: [
              expect.objectContaining({
                value: '1a',
                side: 1,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '1b',
                side: 1,
                position: 1,
                archived: false,
              }),
              expect.objectContaining({
                value: '2a',
                side: 0,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '2b',
                side: 0,
                position: 1,
                archived: false,
              }),
            ],
          }),
          databaseState: [
            expect.objectContaining({
              fields: [
                expect.objectContaining({
                  value: '1a',
                  side: 1,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '1b',
                  side: 1,
                  position: 1,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2a',
                  side: 0,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2b',
                  side: 0,
                  position: 1,
                  archived: false,
                }),
              ],
              reviewables: [
                expect.objectContaining({
                  archived: true,
                  fields: [
                    expect.objectContaining({
                      reviewable: 1,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 2,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 3,
                      side: 1,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 4,
                      side: 1,
                    }),
                  ],
                }),
                expect.objectContaining({
                  archived: false,
                  fields: [
                    expect.objectContaining({
                      reviewable: 2,
                      field: 1,
                      side: 1,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 2,
                      side: 1,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 3,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 4,
                      side: 0,
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      },
    ])('$name', async ({ fixture, input, expected }) => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const { createNote } = await import('../createNote')
      const { default: updateNote } = await import('./updateNote')
      const [{ collectionId }] = await database
        .insert(collection)
        .values({ name: 'Collection Name' })
        .returning({ collectionId: collection.id })
      const { id: noteId } = await createNote({
        collections: [collectionId],
        ...fixture.note,
      })

      const output = await updateNote({
        id: noteId,
        fields: input.fields,
      })
      const databaseState = await database.query.note.findMany({
        where: eq(note.id, noteId),
        with: {
          fields: true,
          reviewables: {
            with: {
              fields: true,
            },
          },
        },
      })

      expect(output).toEqual(expected.output)
      expect(databaseState).toEqual(expected.databaseState)

      resetDatabaseMock()
    })

    test.each([
      {
        name: 'includes a note field on the first side in the first position that was previously archived, the correct state is produced and returned',
        fixture: {
          note: [
            {
              fields: [[{ value: '1a' }, { value: '1b' }], [{ value: '2a' }]],
              config: { reversible: false, separable: false },
            },
            {
              fields: [[{ value: '1b' }], [{ value: '2a' }]],
              config: { reversible: false, separable: false },
            },
          ],
        },
        expected: {
          output: expect.objectContaining({
            fields: [
              expect.objectContaining({
                value: '1a',
                side: 0,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '1b',
                side: 0,
                position: 1,
                archived: false,
              }),
              expect.objectContaining({
                value: '2a',
                side: 1,
                position: 0,
                archived: false,
              }),
            ],
          }),
          databaseState: [
            expect.objectContaining({
              fields: [
                expect.objectContaining({
                  value: '1a',
                  side: 0,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '1b',
                  side: 0,
                  position: 1,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2a',
                  side: 1,
                  position: 0,
                  archived: false,
                }),
              ],
              reviewables: [
                expect.objectContaining({
                  archived: false,
                  fields: [
                    expect.objectContaining({
                      reviewable: 1,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 2,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 3,
                      side: 1,
                    }),
                  ],
                }),
                expect.objectContaining({
                  archived: true,
                  fields: [
                    expect.objectContaining({
                      reviewable: 2,
                      field: 2,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 3,
                      side: 1,
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      },
      {
        name: 'includes a note field on the second side in the first position that was previously archived, the correct state is produced and returned',
        fixture: {
          note: [
            {
              fields: [[{ value: '1a' }], [{ value: '2a' }, { value: '2b' }]],
              config: { reversible: false, separable: false },
            },
            {
              fields: [[{ value: '1a' }], [{ value: '2b' }]],
              config: { reversible: false, separable: false },
            },
          ],
        },
        expected: {
          output: expect.objectContaining({
            fields: [
              expect.objectContaining({
                value: '1a',
                side: 0,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '2a',
                side: 1,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '2b',
                side: 1,
                position: 1,
                archived: false,
              }),
            ],
          }),
          databaseState: [
            expect.objectContaining({
              fields: [
                expect.objectContaining({
                  value: '1a',
                  side: 0,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2a',
                  side: 1,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2b',
                  side: 1,
                  position: 1,
                  archived: false,
                }),
              ],
              reviewables: [
                expect.objectContaining({
                  archived: false,
                  fields: [
                    expect.objectContaining({
                      reviewable: 1,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 2,
                      side: 1,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 3,
                      side: 1,
                    }),
                  ],
                }),
                expect.objectContaining({
                  archived: true,
                  fields: [
                    expect.objectContaining({
                      reviewable: 2,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 3,
                      side: 1,
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      },
      {
        name: 'includes a note field on the first side in the last position that was previously archived, the correct state is produced and returned',
        fixture: {
          note: [
            {
              fields: [[{ value: '1a' }, { value: '1b' }], [{ value: '2a' }]],
              config: { reversible: false, separable: false },
            },
            {
              fields: [[{ value: '1a' }], [{ value: '2a' }]],
              config: { reversible: false, separable: false },
            },
          ],
        },
        expected: {
          output: expect.objectContaining({
            fields: [
              expect.objectContaining({
                value: '1a',
                side: 0,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '1b',
                side: 0,
                position: 1,
                archived: false,
              }),
              expect.objectContaining({
                value: '2a',
                side: 1,
                position: 0,
                archived: false,
              }),
            ],
          }),
          databaseState: [
            expect.objectContaining({
              fields: [
                expect.objectContaining({
                  value: '1a',
                  side: 0,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '1b',
                  side: 0,
                  position: 1,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2a',
                  side: 1,
                  position: 0,
                  archived: false,
                }),
              ],
              reviewables: [
                expect.objectContaining({
                  archived: false,
                  fields: [
                    expect.objectContaining({
                      reviewable: 1,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 2,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 3,
                      side: 1,
                    }),
                  ],
                }),
                expect.objectContaining({
                  archived: true,
                  fields: [
                    expect.objectContaining({
                      reviewable: 2,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 3,
                      side: 1,
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      },
      {
        name: 'includes a note field on the second side in the last position that was previously archived, the correct state is produced and returned',
        fixture: {
          note: [
            {
              fields: [[{ value: '1a' }], [{ value: '2a' }, { value: '2b' }]],
              config: { reversible: false, separable: false },
            },
            {
              fields: [[{ value: '1a' }], [{ value: '2a' }]],
              config: { reversible: false, separable: false },
            },
          ],
        },
        expected: {
          output: expect.objectContaining({
            fields: [
              expect.objectContaining({
                value: '1a',
                side: 0,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '2a',
                side: 1,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '2b',
                side: 1,
                position: 1,
                archived: false,
              }),
            ],
          }),
          databaseState: [
            expect.objectContaining({
              fields: [
                expect.objectContaining({
                  value: '1a',
                  side: 0,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2a',
                  side: 1,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2b',
                  side: 1,
                  position: 1,
                  archived: false,
                }),
              ],
              reviewables: [
                expect.objectContaining({
                  archived: false,
                  fields: [
                    expect.objectContaining({
                      reviewable: 1,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 2,
                      side: 1,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 3,
                      side: 1,
                    }),
                  ],
                }),
                expect.objectContaining({
                  archived: true,
                  fields: [
                    expect.objectContaining({
                      reviewable: 2,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 2,
                      side: 1,
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      },
    ])('$name', async ({ fixture, expected }) => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const { createNote } = await import('../createNote')
      const { default: updateNote } = await import('./updateNote')
      const [{ collectionId }] = await database
        .insert(collection)
        .values({ name: 'Collection Name' })
        .returning({ collectionId: collection.id })
      const { id: noteId } = await createNote({
        collections: [collectionId],
        ...fixture.note[0],
      })
      await updateNote({
        id: noteId,
        ...fixture.note[1],
      })

      const output = await updateNote({
        id: noteId,
        ...fixture.note[0],
      })
      const databaseState = await database.query.note.findMany({
        where: eq(note.id, noteId),
        with: {
          fields: true,
          reviewables: {
            with: {
              fields: true,
            },
          },
        },
      })

      expect(output).toEqual(expected.output)
      expect(databaseState).toEqual(expected.databaseState)

      resetDatabaseMock()
    })
  })

  describe('when the new config provided', () => {
    test.each([
      {
        name: 'updates the note from not reversible to reversible, the correct state is produced and returned',
        fixture: {
          note: {
            fields: [[{ value: '1' }], [{ value: '2' }]],
            config: { reversible: false, separable: false },
          },
        },
        input: {
          config: { reversible: true, separable: false },
        },
        expected: {
          output: expect.objectContaining({
            reversible: true,
            separable: false,
            fields: [
              expect.objectContaining({
                value: '1',
                side: 0,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '2',
                side: 1,
                position: 0,
                archived: false,
              }),
            ],
          }),
          databaseState: [
            expect.objectContaining({
              reversible: true,
              separable: false,
              fields: [
                expect.objectContaining({
                  value: '1',
                  side: 0,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2',
                  side: 1,
                  position: 0,
                  archived: false,
                }),
              ],
              reviewables: [
                expect.objectContaining({
                  archived: false,
                  fields: [
                    expect.objectContaining({
                      reviewable: 1,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 2,
                      side: 1,
                    }),
                  ],
                }),
                expect.objectContaining({
                  archived: false,
                  fields: [
                    expect.objectContaining({
                      reviewable: 2,
                      field: 2,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 1,
                      side: 1,
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      },
      {
        name: 'updates the note from reversible to not reversible, the correct state is produced and returned',
        fixture: {
          note: {
            fields: [[{ value: '1' }], [{ value: '2' }]],
            config: { reversible: true, separable: false },
          },
        },
        input: {
          config: { reversible: false, separable: false },
        },
        expected: {
          output: expect.objectContaining({
            reversible: false,
            separable: false,
            fields: [
              expect.objectContaining({
                value: '1',
                side: 0,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '2',
                side: 1,
                position: 0,
                archived: false,
              }),
            ],
          }),
          databaseState: [
            expect.objectContaining({
              reversible: false,
              separable: false,
              fields: [
                expect.objectContaining({
                  value: '1',
                  side: 0,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2',
                  side: 1,
                  position: 0,
                  archived: false,
                }),
              ],
              reviewables: [
                expect.objectContaining({
                  archived: false,
                  fields: [
                    expect.objectContaining({
                      reviewable: 1,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 2,
                      side: 1,
                    }),
                  ],
                }),
                expect.objectContaining({
                  archived: true,
                  fields: [
                    expect.objectContaining({
                      reviewable: 2,
                      field: 2,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 1,
                      side: 1,
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      },
      {
        name: 'updates the note from not separable to separable, the correct state is produced and returned',
        fixture: {
          note: {
            fields: [[{ value: '1a' }], [{ value: '2a' }, { value: '2b' }]],
            config: { reversible: false, separable: false },
          },
        },
        input: {
          config: { reversible: false, separable: true },
        },
        expected: {
          output: expect.objectContaining({
            reversible: false,
            separable: true,
            fields: [
              expect.objectContaining({
                value: '1a',
                side: 0,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '2a',
                side: 1,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '2b',
                side: 1,
                position: 1,
                archived: false,
              }),
            ],
          }),
          databaseState: [
            expect.objectContaining({
              reversible: false,
              separable: true,
              fields: [
                expect.objectContaining({
                  value: '1a',
                  side: 0,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2a',
                  side: 1,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2b',
                  side: 1,
                  position: 1,
                  archived: false,
                }),
              ],
              reviewables: [
                expect.objectContaining({
                  archived: true,
                  fields: [
                    expect.objectContaining({
                      reviewable: 1,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 2,
                      side: 1,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 3,
                      side: 1,
                    }),
                  ],
                }),
                expect.objectContaining({
                  archived: false,
                  fields: [
                    expect.objectContaining({
                      reviewable: 2,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 2,
                      side: 1,
                    }),
                  ],
                }),
                expect.objectContaining({
                  archived: false,
                  fields: [
                    expect.objectContaining({
                      reviewable: 3,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 3,
                      field: 3,
                      side: 1,
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      },
      {
        name: 'updates the note from separable to not separable, the correct state is produced and returned',
        fixture: {
          note: {
            fields: [[{ value: '1a' }], [{ value: '2a' }, { value: '2b' }]],
            config: { reversible: false, separable: true },
          },
        },
        input: {
          config: { reversible: false, separable: false },
        },
        expected: {
          output: expect.objectContaining({
            reversible: false,
            separable: false,
            fields: [
              expect.objectContaining({
                value: '1a',
                side: 0,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '2a',
                side: 1,
                position: 0,
                archived: false,
              }),
              expect.objectContaining({
                value: '2b',
                side: 1,
                position: 1,
                archived: false,
              }),
            ],
          }),
          databaseState: [
            expect.objectContaining({
              reversible: false,
              separable: false,
              fields: [
                expect.objectContaining({
                  value: '1a',
                  side: 0,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2a',
                  side: 1,
                  position: 0,
                  archived: false,
                }),
                expect.objectContaining({
                  value: '2b',
                  side: 1,
                  position: 1,
                  archived: false,
                }),
              ],
              reviewables: [
                expect.objectContaining({
                  archived: true,
                  fields: [
                    expect.objectContaining({
                      reviewable: 1,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 1,
                      field: 2,
                      side: 1,
                    }),
                  ],
                }),
                expect.objectContaining({
                  archived: true,
                  fields: [
                    expect.objectContaining({
                      reviewable: 2,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 2,
                      field: 3,
                      side: 1,
                    }),
                  ],
                }),
                expect.objectContaining({
                  archived: false,
                  fields: [
                    expect.objectContaining({
                      reviewable: 3,
                      field: 1,
                      side: 0,
                    }),
                    expect.objectContaining({
                      reviewable: 3,
                      field: 2,
                      side: 1,
                    }),
                    expect.objectContaining({
                      reviewable: 3,
                      field: 3,
                      side: 1,
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      },
    ])('$name', async ({ fixture, input, expected }) => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const { createNote } = await import('../createNote')
      const { default: updateNote } = await import('./updateNote')
      const [{ collectionId }] = await database
        .insert(collection)
        .values({ name: 'Collection Name' })
        .returning({ collectionId: collection.id })
      const { id: noteId } = await createNote({
        collections: [collectionId],
        ...fixture.note,
      })

      const output = await updateNote({
        id: noteId,
        config: input.config,
      })
      const databaseState = await database.query.note.findMany({
        where: eq(note.id, noteId),
        with: {
          fields: true,
          reviewables: {
            with: {
              fields: true,
            },
          },
        },
      })

      expect(output).toEqual(expected.output)
      expect(databaseState).toEqual(expected.databaseState)

      resetDatabaseMock()
    })
  })
})
