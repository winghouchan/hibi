import { collection, collectionToNote } from '@/collections/schema'
import { reviewable } from '@/reviews/schema'
import { mockDatabase } from '@/test/utils'
import { eq } from 'drizzle-orm'
import createNoteFn from '../createNote'
import hashNoteFieldValue from '../hashNoteFieldValue'
import { note, noteField } from '../schema'

type DatabaseMock = Awaited<ReturnType<typeof mockDatabase>>

describe('updateNote', () => {
  describe('when given no collections', () => {
    it('does nothing', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const { default: updateNote } = await import('.')
      const [{ existingCollectionId }] = await database
        .insert(collection)
        .values({ name: 'Collection 1' })
        .returning({ existingCollectionId: collection.id })
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      await database.insert(collectionToNote).values({
        collection: existingCollectionId,
        note: noteId,
      })
      const precedingState = await database.query.collectionToNote.findMany({
        where: eq(collectionToNote.note, noteId),
      })

      const returnedState = await updateNote({ id: noteId })
      const succeedingState = await database.query.collectionToNote.findMany({
        where: eq(collectionToNote.note, noteId),
      })

      expect(returnedState).toEqual(
        expect.objectContaining({
          collections: [
            expect.objectContaining({
              id: existingCollectionId,
            }),
          ],
        }),
      )
      expect(succeedingState).toEqual(precedingState)

      resetDatabaseMock()
    })
  })

  describe('when given collection(s)', () => {
    it('is able to move a note into a new collection', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const { default: updateNote } = await import('.')
      const [{ existingCollectionId }] = await database
        .insert(collection)
        .values({ name: 'Collection 1' })
        .returning({ existingCollectionId: collection.id })
      const [{ newCollectionId }] = await database
        .insert(collection)
        .values({ name: 'Collection 2' })
        .returning({ newCollectionId: collection.id })
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      await database.insert(collectionToNote).values({
        collection: existingCollectionId,
        note: noteId,
      })

      const returnedState = await updateNote({
        id: noteId,
        collections: [newCollectionId],
      })
      const queriedState = await database.query.collectionToNote.findMany({
        where: eq(collectionToNote.note, noteId),
      })

      expect(returnedState).toEqual(
        expect.objectContaining({
          collections: [
            expect.objectContaining({
              id: newCollectionId,
            }),
          ],
        }),
      )
      expect(queriedState).toHaveLength(1)
      expect(queriedState[0]).toHaveProperty('note', noteId)
      expect(queriedState[0]).toHaveProperty('collection', newCollectionId)

      resetDatabaseMock()
    })

    it('is able to add a note to a new collection', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const { default: updateNote } = await import('.')
      const [{ existingCollectionId }] = await database
        .insert(collection)
        .values({ name: 'Collection 1' })
        .returning({ existingCollectionId: collection.id })
      const [{ newCollectionId }] = await database
        .insert(collection)
        .values({ name: 'Collection 2' })
        .returning({ newCollectionId: collection.id })
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      const [{ created_at }] = await database
        .insert(collectionToNote)
        .values({
          collection: existingCollectionId,
          note: noteId,
        })
        .returning()

      const returnedState = await updateNote({
        id: noteId,
        collections: [existingCollectionId, newCollectionId],
      })
      const queriedState = await database.query.collectionToNote.findMany({
        where: eq(collectionToNote.note, noteId),
      })

      expect(returnedState).toEqual(
        expect.objectContaining({
          collections: [
            expect.objectContaining({
              id: existingCollectionId,
            }),
            expect.objectContaining({
              id: newCollectionId,
            }),
          ],
        }),
      )
      expect(queriedState).toEqual([
        expect.objectContaining({
          note: noteId,
          collection: existingCollectionId,
          created_at,
        }),
        expect.objectContaining({
          note: noteId,
          collection: newCollectionId,
        }),
      ])

      resetDatabaseMock()
    })

    it('is able to remove a note from a collection', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const { default: updateNote } = await import('.')
      const [collectionToKeepNoteIn] = await database
        .insert(collection)
        .values({ name: 'Collection 1' })
        .returning()
      const [collectionToRemoveNoteFrom] = await database
        .insert(collection)
        .values({ name: 'Collection 2' })
        .returning()
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      await database
        .insert(collectionToNote)
        .values([
          { collection: collectionToKeepNoteIn.id, note: noteId },
          { collection: collectionToRemoveNoteFrom.id, note: noteId },
        ])
        .returning()

      const returnedState = await updateNote({
        id: noteId,
        collections: [collectionToKeepNoteIn.id],
      })
      const queriedState = await database.query.collectionToNote.findMany()

      expect(returnedState).toEqual(
        expect.objectContaining({
          collections: [
            expect.objectContaining({
              id: collectionToKeepNoteIn.id,
            }),
          ],
        }),
      )
      expect(queriedState).toHaveLength(1)
      expect(queriedState[0]).toHaveProperty(
        'collection',
        collectionToKeepNoteIn.id,
      )
      expect(queriedState[0]).toHaveProperty('note', noteId)

      resetDatabaseMock()
    })

    it('does not leave a note without a collection', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const { default: updateNote } = await import('.')
      const [{ existingCollectionId }] = await database
        .insert(collection)
        .values({ name: 'Collection 1' })
        .returning({ existingCollectionId: collection.id })
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      await database.insert(collectionToNote).values({
        collection: existingCollectionId,
        note: noteId,
      })

      const returnedState = await updateNote({ id: noteId, collections: [] })
      const queriedState = await database.query.collectionToNote.findMany({
        where: eq(collectionToNote.note, noteId),
      })

      expect(returnedState).toEqual(
        expect.objectContaining({
          collections: [
            expect.objectContaining({
              id: existingCollectionId,
            }),
          ],
        }),
      )
      expect(queriedState).toHaveLength(1)
      expect(queriedState[0]).toHaveProperty('note', noteId)
      expect(queriedState[0]).toHaveProperty('collection', existingCollectionId)

      resetDatabaseMock()
    })

    it('does not add a note to a non-existent collection', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const { default: updateNote } = await import('.')
      const [{ existingCollectionId }] = await database
        .insert(collection)
        .values({ name: 'Collection 1' })
        .returning({ existingCollectionId: collection.id })
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      await database.insert(collectionToNote).values({
        collection: existingCollectionId,
        note: noteId,
      })
      const nonExistentCollectionId = 0

      await expect(
        updateNote({
          id: noteId,
          collections: [existingCollectionId, nonExistentCollectionId],
        }),
      ).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining('FOREIGN KEY constraint failed'),
        }),
      )
      const output = await database.query.collectionToNote.findMany({
        where: eq(collectionToNote.note, noteId),
      })

      expect(output).toHaveLength(1)
      expect(output[0]).toHaveProperty('note', noteId)
      expect(output[0]).toHaveProperty('collection', existingCollectionId)

      resetDatabaseMock()
    })

    it('does nothing if note is already in the collection', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const { default: updateNote } = await import('.')
      const [{ existingCollectionId }] = await database
        .insert(collection)
        .values({ name: 'Collection 1' })
        .returning({ existingCollectionId: collection.id })
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      await database.insert(collectionToNote).values({
        collection: existingCollectionId,
        note: noteId,
      })
      const precedingState = await database.query.collectionToNote.findMany({
        where: eq(collectionToNote.note, noteId),
      })

      const returnedState = await updateNote({
        id: noteId,
        collections: [existingCollectionId],
      })
      const succeedingState = await database.query.collectionToNote.findMany({
        where: eq(collectionToNote.note, noteId),
      })

      expect(returnedState).toEqual(
        expect.objectContaining({
          collections: [
            expect.objectContaining({
              id: existingCollectionId,
            }),
          ],
        }),
      )
      expect(succeedingState).toEqual(precedingState)

      resetDatabaseMock()
    })
  })

  describe('when given no fields', () => {
    it('does nothing', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const { default: updateNote } = await import('.')
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      await database.insert(noteField).values(
        ['Field 1', 'Field 2'].map((value, position) => ({
          note: noteId,
          value,
          hash: hashNoteFieldValue(value),
          position,
          side: 0,
        })),
      )
      const precedingState = await database.query.noteField.findMany({
        where: eq(noteField.note, noteId),
      })

      await updateNote({ id: noteId })
      const succeedingState = await database.query.noteField.findMany({
        where: eq(noteField.note, noteId),
      })

      expect(succeedingState).toEqual(precedingState)

      resetDatabaseMock()
    })
  })

  describe('when given field(s)', () => {
    let database: DatabaseMock['database'],
      resetDatabaseMock: DatabaseMock['resetDatabaseMock'],
      collectionMock: typeof collection.$inferSelect,
      createNote: typeof createNoteFn

    beforeEach(async () => {
      ;({ database, resetDatabaseMock } = await mockDatabase())
      createNote = (await import('../createNote')).default

      collectionMock = (
        await database
          .insert(collection)
          .values({ name: 'Collection 1' })
          .returning()
      )[0]
    })

    afterEach(() => {
      resetDatabaseMock()
    })

    it('is able to replace a single note field on the first side', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [[{ value: '1' }], [{ value: '2' }]]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: existingNoteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })
      const newNoteFields = [{ value: '1a' }]

      await updateNote({
        id: noteMock.id,
        fields: [newNoteFields, existingNoteFields[1]],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0][0].value,
          side: 0,
          position: 0,
          is_archived: true,
        }),
        expect.objectContaining({
          value: existingNoteFields[1][0].value,
          side: 1,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: newNoteFields[0].value,
          side: 0,
          position: 0,
          is_archived: false,
        }),
      ])
    })

    it('is able to replace a single note field on the second side', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [[{ value: '1' }], [{ value: '2' }]]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: existingNoteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })
      const newNoteFields = [{ value: '2a' }]

      await updateNote({
        id: noteMock.id,
        fields: [existingNoteFields[0], newNoteFields],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0][0].value,
          side: 0,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1][0].value,
          side: 1,
          position: 0,
          is_archived: true,
        }),
        expect.objectContaining({
          value: newNoteFields[0].value,
          side: 1,
          position: 0,
          is_archived: false,
        }),
      ])
    })

    it('is able to replace multiple note fields on the first side', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [
        [{ value: '1a' }, { value: '1b' }],
        [{ value: '2' }],
      ]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: existingNoteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })
      const newNoteFields = [{ value: '1A' }, { value: '1B' }]

      await updateNote({
        id: noteMock.id,
        fields: [newNoteFields, existingNoteFields[1]],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0][0].value,
          side: 0,
          position: 0,
          is_archived: true,
        }),
        expect.objectContaining({
          value: existingNoteFields[0][1].value,
          side: 0,
          position: 1,
          is_archived: true,
        }),
        expect.objectContaining({
          value: existingNoteFields[1][0].value,
          side: 1,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: newNoteFields[0].value,
          side: 0,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: newNoteFields[1].value,
          side: 0,
          position: 1,
          is_archived: false,
        }),
      ])
    })

    it('is able to replace multiple note fields on the second side', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [
        [{ value: '1' }],
        [{ value: '2a' }, { value: '2b' }],
      ]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: existingNoteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })
      const newNoteFields = [{ value: '2A' }, { value: '2B' }]

      await updateNote({
        id: noteMock.id,
        fields: [existingNoteFields[0], newNoteFields],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0][0].value,
          side: 0,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1][0].value,
          side: 1,
          position: 0,
          is_archived: true,
        }),
        expect.objectContaining({
          value: existingNoteFields[1][1].value,
          side: 1,
          position: 1,
          is_archived: true,
        }),
        expect.objectContaining({
          value: newNoteFields[0].value,
          side: 1,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: newNoteFields[1].value,
          side: 1,
          position: 1,
          is_archived: false,
        }),
      ])
    })

    it('is able to prepend a note field on the first side', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [[{ value: '1' }], [{ value: '2' }]]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: existingNoteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })
      const newNoteFields = [{ value: 'a' }]

      await updateNote({
        id: noteMock.id,
        fields: [
          [...newNoteFields, ...existingNoteFields[0]],
          existingNoteFields[1],
        ],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0][0].value,
          side: 0,
          position: 1,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1][0].value,
          side: 1,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: newNoteFields[0].value,
          side: 0,
          position: 0,
          is_archived: false,
        }),
      ])
    })

    it('is able to prepend a note field on the second side', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [[{ value: '1' }], [{ value: '2' }]]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: existingNoteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })
      const newNoteFields = [{ value: 'a' }]

      await updateNote({
        id: noteMock.id,
        fields: [
          existingNoteFields[0],
          [...newNoteFields, ...existingNoteFields[1]],
        ],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0][0].value,
          side: 0,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1][0].value,
          side: 1,
          position: 1,
          is_archived: false,
        }),
        expect.objectContaining({
          value: newNoteFields[0].value,
          side: 1,
          position: 0,
          is_archived: false,
        }),
      ])
    })

    it('is able to prepend a note field on the first side with a value of an existing note field', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [[{ value: '1' }], [{ value: '2' }]]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: existingNoteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })
      const newNoteFields = [{ value: '2' }]

      await updateNote({
        id: noteMock.id,
        fields: [
          [...newNoteFields, ...existingNoteFields[0]],
          existingNoteFields[1],
        ],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0][0].value,
          side: 0,
          position: 1,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1][0].value,
          side: 0,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: newNoteFields[0].value,
          side: 1,
          position: 0,
          is_archived: false,
        }),
      ])
    })

    it('is able to prepend a note field on the second side with a value of an existing note field', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [[{ value: '1' }], [{ value: '2' }]]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: existingNoteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })
      const newNoteFields = [{ value: '1' }]

      await updateNote({
        id: noteMock.id,
        fields: [
          existingNoteFields[0],
          [...newNoteFields, ...existingNoteFields[1]],
        ],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0][0].value,
          side: 0,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1][0].value,
          side: 1,
          position: 1,
          is_archived: false,
        }),
        expect.objectContaining({
          value: newNoteFields[0].value,
          side: 1,
          position: 0,
          is_archived: false,
        }),
      ])
    })

    it('is able to append a note field on the first side', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [[{ value: '1' }], [{ value: '2' }]]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: existingNoteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })
      const newNoteFields = [{ value: 'a' }]

      await updateNote({
        id: noteMock.id,
        fields: [
          [...existingNoteFields[0], ...newNoteFields],
          existingNoteFields[1],
        ],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0][0].value,
          side: 0,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1][0].value,
          side: 1,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: newNoteFields[0].value,
          side: 0,
          position: 1,
          is_archived: false,
        }),
      ])
    })

    it('is able to append a note field on the second side', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [[{ value: '1' }], [{ value: '2' }]]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: existingNoteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })
      const newNoteFields = [{ value: 'a' }]

      await updateNote({
        id: noteMock.id,
        fields: [
          existingNoteFields[0],
          [...existingNoteFields[1], ...newNoteFields],
        ],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0][0].value,
          side: 0,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1][0].value,
          side: 1,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: newNoteFields[0].value,
          side: 1,
          position: 1,
          is_archived: false,
        }),
      ])
    })

    it('is able to append a note field on the first side with a value of an existing note field', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [[{ value: '1' }], [{ value: '2' }]]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: existingNoteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })
      const newNoteFields = [{ value: '1' }]

      await updateNote({
        id: noteMock.id,
        fields: [
          [...existingNoteFields[0], ...newNoteFields],
          existingNoteFields[1],
        ],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0][0].value,
          side: 0,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1][0].value,
          side: 1,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: newNoteFields[0].value,
          side: 0,
          position: 1,
          is_archived: false,
        }),
      ])
    })

    it('is able to append a note field on the second side with a value of an existing note field', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [[{ value: '1' }], [{ value: '2' }]]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: existingNoteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })
      const newNoteFields = [{ value: '2' }]

      await updateNote({
        id: noteMock.id,
        fields: [
          existingNoteFields[0],
          [...existingNoteFields[1], ...newNoteFields],
        ],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0][0].value,
          side: 0,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1][0].value,
          side: 1,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: newNoteFields[0].value,
          side: 1,
          position: 1,
          is_archived: false,
        }),
      ])
    })

    it('is able to remove the first note field on the first side', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [
        [{ value: '1a' }, { value: '1b' }],
        [{ value: '2' }],
      ]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: existingNoteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })

      await updateNote({
        id: noteMock.id,
        fields: [[existingNoteFields[0][1]], existingNoteFields[1]],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0][0].value,
          side: 0,
          position: 0,
          is_archived: true,
        }),
        expect.objectContaining({
          value: existingNoteFields[0][1].value,
          side: 0,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1][0].value,
          side: 1,
          position: 0,
          is_archived: false,
        }),
      ])
    })

    it('is able to remove the first note field on the second side', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [
        [{ value: '1' }],
        [{ value: '2a' }, { value: '2b' }],
      ]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: existingNoteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })

      await updateNote({
        id: noteMock.id,
        fields: [existingNoteFields[0], [existingNoteFields[1][1]]],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0][0].value,
          side: 0,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1][0].value,
          side: 1,
          position: 0,
          is_archived: true,
        }),
        expect.objectContaining({
          value: existingNoteFields[1][1].value,
          side: 1,
          position: 0,
          is_archived: false,
        }),
      ])
    })

    it('is able to remove the last note field on the first side', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [
        [{ value: '1a' }, { value: '1b' }],
        [{ value: '2' }],
      ]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: existingNoteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })

      await updateNote({
        id: noteMock.id,
        fields: [[existingNoteFields[0][0]], existingNoteFields[1]],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0][0].value,
          side: 0,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[0][1].value,
          side: 0,
          position: 1,
          is_archived: true,
        }),
        expect.objectContaining({
          value: existingNoteFields[1][0].value,
          side: 1,
          position: 0,
          is_archived: false,
        }),
      ])
    })

    it('is able to remove the last note field on the second side', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [
        [{ value: '1' }],
        [{ value: '2a' }, { value: '2b' }],
      ]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: existingNoteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })

      await updateNote({
        id: noteMock.id,
        fields: [existingNoteFields[0], [existingNoteFields[1][0]]],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0][0].value,
          side: 0,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1][0].value,
          side: 1,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1][1].value,
          side: 1,
          position: 1,
          is_archived: true,
        }),
      ])
    })

    it('is able to remove a note field in between two other note fields on the first side', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [
        [{ value: '1a' }, { value: '1b' }, { value: '1c' }],
        [{ value: '2' }],
      ]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: existingNoteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })

      await updateNote({
        id: noteMock.id,
        fields: [
          [existingNoteFields[0][0], existingNoteFields[0][2]],
          existingNoteFields[1],
        ],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0][0].value,
          side: 0,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[0][1].value,
          side: 0,
          position: 1,
          is_archived: true,
        }),
        expect.objectContaining({
          value: existingNoteFields[0][2].value,
          side: 0,
          position: 1,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1][0].value,
          side: 1,
          position: 0,
          is_archived: false,
        }),
      ])
    })

    it('is able to remove a note field in between two other note fields on the second side', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [
        [{ value: '1' }],
        [{ value: '2a' }, { value: '2b' }, { value: '2c' }],
      ]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: existingNoteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })

      await updateNote({
        id: noteMock.id,
        fields: [
          existingNoteFields[0],
          [existingNoteFields[1][0], existingNoteFields[1][2]],
        ],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0][0].value,
          side: 0,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1][0].value,
          side: 1,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1][1].value,
          side: 1,
          position: 1,
          is_archived: true,
        }),
        expect.objectContaining({
          value: existingNoteFields[1][2].value,
          side: 1,
          position: 1,
          is_archived: false,
        }),
      ])
    })

    it('is able to remove a note field on the first side that has the same value as another note field', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [
        [{ value: '1' }, { value: '1' }],
        [{ value: '2' }],
      ]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: existingNoteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })

      await updateNote({
        id: noteMock.id,
        fields: [[existingNoteFields[0][1]], existingNoteFields[1]],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0][0].value,
          side: 0,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[0][1].value,
          side: 0,
          position: 1,
          is_archived: true,
        }),
        expect.objectContaining({
          value: existingNoteFields[1][0].value,
          side: 1,
          position: 0,
          is_archived: false,
        }),
      ])
    })

    it('is able to remove a note field on the second side that has the same value as another note field', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [
        [{ value: '1' }],
        [{ value: '2' }, { value: '2' }],
      ]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: existingNoteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })

      await updateNote({
        id: noteMock.id,
        fields: [existingNoteFields[0], [existingNoteFields[1][0]]],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0][0].value,
          side: 0,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1][0].value,
          side: 1,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1][1].value,
          side: 1,
          position: 1,
          is_archived: true,
        }),
      ])
    })

    it('is able to insert a new field between two fields on the first side', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [
        [{ value: '1a' }, { value: '1c' }],
        [{ value: '2' }],
      ]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: existingNoteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })
      const newNoteFields = [{ value: '1b' }]

      await updateNote({
        id: noteMock.id,
        fields: [
          [
            existingNoteFields[0][0],
            ...newNoteFields,
            existingNoteFields[0][1],
          ],
          existingNoteFields[1],
        ],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0][0].value,
          side: 0,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[0][1].value,
          side: 0,
          position: 2,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1][0].value,
          side: 1,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: newNoteFields[0].value,
          side: 0,
          position: 1,
          is_archived: false,
        }),
      ])
    })

    it('is able to insert a new field between two fields on the second side', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [
        [{ value: '1' }],
        [{ value: '2a' }, { value: '2c' }],
      ]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: existingNoteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })
      const newNoteFields = [{ value: '2b' }]

      await updateNote({
        id: noteMock.id,
        fields: [
          existingNoteFields[0],
          [
            existingNoteFields[1][0],
            ...newNoteFields,
            existingNoteFields[1][1],
          ],
        ],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0][0].value,
          side: 0,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1][0].value,
          side: 1,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1][1].value,
          side: 1,
          position: 2,
          is_archived: false,
        }),
        expect.objectContaining({
          value: newNoteFields[0].value,
          side: 1,
          position: 1,
          is_archived: false,
        }),
      ])
    })

    it('is able to insert a new field between two fields on the first side with a value of an existing note field', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [
        [{ value: '1a' }, { value: '1c' }],
        [{ value: '2' }],
      ]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: existingNoteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })
      const newNoteFields = [{ value: '1a' }]

      await updateNote({
        id: noteMock.id,
        fields: [
          [
            existingNoteFields[0][0],
            ...newNoteFields,
            existingNoteFields[0][1],
          ],
          existingNoteFields[1],
        ],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0][0].value,
          side: 0,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[0][1].value,
          side: 0,
          position: 2,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1][0].value,
          side: 1,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: newNoteFields[0].value,
          side: 0,
          position: 1,
          is_archived: false,
        }),
      ])
    })

    it('is able to insert a new field between two fields on the second side with a value of an existing note field', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [
        [{ value: '1' }],
        [{ value: '2a' }, { value: '2c' }],
      ]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: existingNoteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })
      const newNoteFields = [{ value: '2a' }]

      await updateNote({
        id: noteMock.id,
        fields: [
          existingNoteFields[0],
          [
            existingNoteFields[1][0],
            ...newNoteFields,
            existingNoteFields[1][1],
          ],
        ],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0][0].value,
          side: 0,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1][0].value,
          side: 1,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1][1].value,
          side: 1,
          position: 2,
          is_archived: false,
        }),
        expect.objectContaining({
          value: newNoteFields[0].value,
          side: 1,
          position: 1,
          is_archived: false,
        }),
      ])
    })

    it('is able to un-archive the first note field on the first side', async () => {
      const { default: updateNote } = await import('.')
      const noteFields = [[{ value: '1' }, { value: '2' }], [{ value: '3' }]]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: noteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })
      // Archive the first note field in the first side
      await updateNote({
        id: noteMock.id,
        fields: [[noteFields[0][1]], noteFields[1]],
      })

      await updateNote({
        id: noteMock.id,
        fields: noteFields,
      })

      const noteFieldsState = await database.select().from(noteField)

      expect(noteFieldsState).toEqual([
        expect.objectContaining({
          value: noteFields[0][0].value,
          side: 0,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: noteFields[0][1].value,
          side: 0,
          position: 1,
          is_archived: false,
        }),
        expect.objectContaining({
          value: noteFields[1][0].value,
          side: 1,
          position: 0,
          is_archived: false,
        }),
      ])
    })

    it('is able to un-archive the first note field on the second side', async () => {
      const { default: updateNote } = await import('.')
      const noteFields = [[{ value: '1' }], [{ value: '2' }, { value: '3' }]]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: noteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })
      // Archive the first note field in the second side
      await updateNote({
        id: noteMock.id,
        fields: [noteFields[0], [noteFields[1][1]]],
      })

      await updateNote({
        id: noteMock.id,
        fields: noteFields,
      })

      const noteFieldsState = await database.select().from(noteField)

      expect(noteFieldsState).toEqual([
        expect.objectContaining({
          value: noteFields[0][0].value,
          side: 0,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: noteFields[1][0].value,
          side: 1,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: noteFields[1][1].value,
          side: 1,
          position: 1,
          is_archived: false,
        }),
      ])
    })

    it('is able to un-archive the last note field on the first side', async () => {
      const { default: updateNote } = await import('.')
      const noteFields = [[{ value: '1' }, { value: '2' }], [{ value: '3' }]]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: noteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })
      // Archive the first note field in the first side
      await updateNote({
        id: noteMock.id,
        fields: [[noteFields[0][0]], noteFields[1]],
      })

      await updateNote({
        id: noteMock.id,
        fields: noteFields,
      })

      const noteFieldsState = await database.select().from(noteField)

      expect(noteFieldsState).toEqual([
        expect.objectContaining({
          value: noteFields[0][0].value,
          side: 0,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: noteFields[0][1].value,
          side: 0,
          position: 1,
          is_archived: false,
        }),
        expect.objectContaining({
          value: noteFields[1][0].value,
          side: 1,
          position: 0,
          is_archived: false,
        }),
      ])
    })

    it('is able to un-archive the last note field on the second side', async () => {
      const { default: updateNote } = await import('.')
      const noteFields = [[{ value: '1' }], [{ value: '2' }, { value: '3' }]]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: noteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })
      // Archive the first note field in the second side
      await updateNote({
        id: noteMock.id,
        fields: [noteFields[0], [noteFields[1][0]]],
      })

      await updateNote({
        id: noteMock.id,
        fields: noteFields,
      })

      const noteFieldsState = await database.select().from(noteField)

      expect(noteFieldsState).toEqual([
        expect.objectContaining({
          value: noteFields[0][0].value,
          side: 0,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: noteFields[1][0].value,
          side: 1,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: noteFields[1][1].value,
          side: 1,
          position: 1,
          is_archived: false,
        }),
      ])
    })

    it('is able to swap note positions of note fields on the first side', async () => {
      const { default: updateNote } = await import('.')
      const noteFields = [[{ value: '1' }, { value: '2' }], [{ value: '3' }]]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: noteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })

      await updateNote({
        id: noteMock.id,
        fields: [[noteFields[0][1], noteFields[0][0]], noteFields[1]],
      })

      const noteFieldsState = await database.select().from(noteField)

      expect(noteFieldsState).toEqual([
        expect.objectContaining({
          value: noteFields[0][0].value,
          side: 0,
          position: 1,
          is_archived: false,
        }),
        expect.objectContaining({
          value: noteFields[0][1].value,
          side: 0,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: noteFields[1][0].value,
          side: 1,
          position: 0,
          is_archived: false,
        }),
      ])
    })

    it('is able to swap note positions of note fields on the second side', async () => {
      const { default: updateNote } = await import('.')
      const noteFields = [[{ value: '1' }], [{ value: '2' }, { value: '3' }]]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: noteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })

      await updateNote({
        id: noteMock.id,
        fields: [noteFields[0], [noteFields[1][1], noteFields[1][0]]],
      })

      const noteFieldsState = await database.select().from(noteField)

      expect(noteFieldsState).toEqual([
        expect.objectContaining({
          value: noteFields[0][0].value,
          side: 0,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: noteFields[1][0].value,
          side: 1,
          position: 1,
          is_archived: false,
        }),
        expect.objectContaining({
          value: noteFields[1][1].value,
          side: 1,
          position: 0,
          is_archived: false,
        }),
      ])
    })

    it('is able to swap the sides of a note with a single note field each', async () => {
      const { default: updateNote } = await import('.')
      const noteFields = [[{ value: '1' }], [{ value: '2' }]]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: noteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })

      await updateNote({
        id: noteMock.id,
        fields: [noteFields[1], noteFields[0]],
      })

      const noteFieldsState = await database.select().from(noteField)

      expect(noteFieldsState).toEqual([
        expect.objectContaining({
          value: noteFields[0][0].value,
          side: 1,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: noteFields[1][0].value,
          side: 0,
          position: 0,
          is_archived: false,
        }),
      ])
    })

    it('is able to swap the sides of a note with multiple note fields', async () => {
      const { default: updateNote } = await import('.')
      const noteFields = [
        [{ value: '1a' }, { value: '1b' }],
        [{ value: '2a' }, { value: '2b' }],
      ]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: noteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })

      await updateNote({
        id: noteMock.id,
        fields: [noteFields[1], noteFields[0]],
      })

      const noteFieldsState = await database.select().from(noteField)

      expect(noteFieldsState).toEqual([
        expect.objectContaining({
          value: noteFields[0][0].value,
          side: 1,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: noteFields[0][1].value,
          side: 1,
          position: 1,
          is_archived: false,
        }),
        expect.objectContaining({
          value: noteFields[1][0].value,
          side: 0,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: noteFields[1][1].value,
          side: 0,
          position: 1,
          is_archived: false,
        }),
      ])
    })
  })

  describe('when given a config', () => {
    let database: DatabaseMock['database'],
      resetDatabaseMock: DatabaseMock['resetDatabaseMock'],
      collectionMock: typeof collection.$inferSelect,
      createNote: typeof createNoteFn

    beforeEach(async () => {
      ;({ database, resetDatabaseMock } = await mockDatabase())
      createNote = (await import('../createNote')).default

      collectionMock = (
        await database
          .insert(collection)
          .values({ name: 'Collection 1' })
          .returning()
      )[0]
    })

    afterEach(() => {
      resetDatabaseMock()
    })

    it('updates the config state of the note', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [[{ value: '1' }], [{ value: '2' }]]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: existingNoteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })
      const newConfig = {
        reversible: true,
        separable: true,
      }

      await updateNote({
        id: noteMock.id,
        fields: existingNoteFields,
        config: newConfig,
      })

      const noteState = await database.query.note.findFirst({
        where: eq(note.id, noteMock.id),
      })

      expect(noteState).toEqual(
        expect.objectContaining({
          is_reversible: true,
          is_separable: true,
        }),
      )
    })

    it('is able to update a note from being not reversible to reversible', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [[{ value: '1' }], [{ value: '2' }]]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: existingNoteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })

      await updateNote({
        id: noteMock.id,
        fields: existingNoteFields,
        config: {
          reversible: true,
        },
      })

      const reviewables = await database.query.reviewable.findMany({
        where: eq(reviewable.note, noteMock.id),
        with: {
          fields: {
            with: {
              field: true,
            },
          },
        },
      })

      expect(reviewables).toEqual([
        expect.objectContaining({
          id: expect.any(Number),
          note: noteMock.id,
          is_archived: false,
          fields: [
            expect.objectContaining({
              side: 0,
              field: expect.objectContaining({
                value: existingNoteFields[0][0].value,
              }),
            }),
            expect.objectContaining({
              side: 1,
              field: expect.objectContaining({
                value: existingNoteFields[1][0].value,
              }),
            }),
          ],
        }),
        expect.objectContaining({
          id: expect.any(Number),
          note: noteMock.id,
          is_archived: false,
          fields: [
            expect.objectContaining({
              side: 0,
              field: expect.objectContaining({
                value: existingNoteFields[1][0].value,
              }),
            }),
            expect.objectContaining({
              side: 1,
              field: expect.objectContaining({
                value: existingNoteFields[0][0].value,
              }),
            }),
          ],
        }),
      ])
    })

    it('is able to update a note from being reversible to not reversible', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [[{ value: '1' }], [{ value: '2' }]]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: existingNoteFields,
        config: {
          reversible: true,
          separable: false,
        },
      })

      await updateNote({
        id: noteMock.id,
        fields: existingNoteFields,
        config: {
          reversible: false,
        },
      })

      const reviewables = await database.query.reviewable.findMany({
        where: eq(reviewable.note, noteMock.id),
        with: {
          fields: {
            with: {
              field: true,
            },
          },
        },
      })

      expect(reviewables).toEqual([
        expect.objectContaining({
          id: expect.any(Number),
          note: noteMock.id,
          is_archived: false,
          fields: [
            expect.objectContaining({
              side: 0,
              field: expect.objectContaining({
                value: existingNoteFields[0][0].value,
              }),
            }),
            expect.objectContaining({
              side: 1,
              field: expect.objectContaining({
                value: existingNoteFields[1][0].value,
              }),
            }),
          ],
        }),
        expect.objectContaining({
          id: expect.any(Number),
          note: noteMock.id,
          is_archived: true,
          fields: [
            expect.objectContaining({
              side: 0,
              field: expect.objectContaining({
                value: existingNoteFields[1][0].value,
              }),
            }),
            expect.objectContaining({
              side: 1,
              field: expect.objectContaining({
                value: existingNoteFields[0][0].value,
              }),
            }),
          ],
        }),
      ])
    })

    it('is able to update a note from being not separable to separable', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [
        [{ value: '1' }],
        [{ value: '2' }, { value: '3' }],
      ]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: existingNoteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })

      await updateNote({
        id: noteMock.id,
        fields: existingNoteFields,
        config: {
          separable: true,
        },
      })

      const reviewables = await database.query.reviewable.findMany({
        where: eq(reviewable.note, noteMock.id),
        with: {
          fields: {
            with: {
              field: true,
            },
          },
        },
      })

      expect(reviewables).toEqual([
        expect.objectContaining({
          id: expect.any(Number),
          note: noteMock.id,
          is_archived: true,
          fields: [
            expect.objectContaining({
              side: 0,
              field: expect.objectContaining({
                value: existingNoteFields[0][0].value,
              }),
            }),
            expect.objectContaining({
              side: 1,
              field: expect.objectContaining({
                value: existingNoteFields[1][0].value,
              }),
            }),
            expect.objectContaining({
              side: 1,
              field: expect.objectContaining({
                value: existingNoteFields[1][1].value,
              }),
            }),
          ],
        }),
        expect.objectContaining({
          id: expect.any(Number),
          note: noteMock.id,
          is_archived: false,
          fields: [
            expect.objectContaining({
              side: 0,
              field: expect.objectContaining({
                value: existingNoteFields[0][0].value,
              }),
            }),
            expect.objectContaining({
              side: 1,
              field: expect.objectContaining({
                value: existingNoteFields[1][0].value,
              }),
            }),
          ],
        }),
        expect.objectContaining({
          id: expect.any(Number),
          note: noteMock.id,
          is_archived: false,
          fields: [
            expect.objectContaining({
              side: 0,
              field: expect.objectContaining({
                value: existingNoteFields[0][0].value,
              }),
            }),
            expect.objectContaining({
              side: 1,
              field: expect.objectContaining({
                value: existingNoteFields[1][1].value,
              }),
            }),
          ],
        }),
      ])
    })

    it('is able to update a note from being separable to not separable', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [
        [{ value: '1' }],
        [{ value: '2' }, { value: '3' }],
      ]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: existingNoteFields,
        config: {
          reversible: false,
          separable: true,
        },
      })

      await updateNote({
        id: noteMock.id,
        fields: existingNoteFields,
        config: {
          separable: false,
        },
      })

      const reviewables = await database.query.reviewable.findMany({
        where: eq(reviewable.note, noteMock.id),
        with: {
          fields: {
            with: {
              field: true,
            },
          },
        },
      })

      expect(reviewables).toEqual([
        expect.objectContaining({
          id: expect.any(Number),
          note: noteMock.id,
          is_archived: true,
          fields: [
            expect.objectContaining({
              side: 0,
              field: expect.objectContaining({
                value: existingNoteFields[0][0].value,
              }),
            }),
            expect.objectContaining({
              side: 1,
              field: expect.objectContaining({
                value: existingNoteFields[1][0].value,
              }),
            }),
          ],
        }),
        expect.objectContaining({
          id: expect.any(Number),
          note: noteMock.id,
          is_archived: true,
          fields: [
            expect.objectContaining({
              side: 0,
              field: expect.objectContaining({
                value: existingNoteFields[0][0].value,
              }),
            }),
            expect.objectContaining({
              side: 1,
              field: expect.objectContaining({
                value: existingNoteFields[1][1].value,
              }),
            }),
          ],
        }),
        expect.objectContaining({
          id: expect.any(Number),
          note: noteMock.id,
          is_archived: false,
          fields: [
            expect.objectContaining({
              side: 0,
              field: expect.objectContaining({
                value: existingNoteFields[0][0].value,
              }),
            }),
            expect.objectContaining({
              side: 1,
              field: expect.objectContaining({
                value: existingNoteFields[1][0].value,
              }),
            }),
            expect.objectContaining({
              side: 1,
              field: expect.objectContaining({
                value: existingNoteFields[1][1].value,
              }),
            }),
          ],
        }),
      ])
    })

    it('is able to un-archive a reviewable', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [
        [{ value: '1' }],
        [{ value: '2' }, { value: '3' }],
      ]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: existingNoteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })
      await updateNote({
        id: noteMock.id,
        config: {
          separable: true,
        },
      })
      await updateNote({
        id: noteMock.id,
        config: {
          separable: false,
        },
      })

      const reviewables = await database.query.reviewable.findMany({
        where: eq(reviewable.note, noteMock.id),
        with: {
          fields: {
            with: {
              field: true,
            },
          },
        },
      })

      expect(reviewables).toEqual([
        expect.objectContaining({
          id: expect.any(Number),
          note: noteMock.id,
          is_archived: false,
          fields: [
            expect.objectContaining({
              side: 0,
              field: expect.objectContaining({
                value: existingNoteFields[0][0].value,
              }),
            }),
            expect.objectContaining({
              side: 1,
              field: expect.objectContaining({
                value: existingNoteFields[1][0].value,
              }),
            }),
            expect.objectContaining({
              side: 1,
              field: expect.objectContaining({
                value: existingNoteFields[1][1].value,
              }),
            }),
          ],
        }),
        expect.objectContaining({
          id: expect.any(Number),
          note: noteMock.id,
          is_archived: true,
          fields: [
            expect.objectContaining({
              side: 0,
              field: expect.objectContaining({
                value: existingNoteFields[0][0].value,
              }),
            }),
            expect.objectContaining({
              side: 1,
              field: expect.objectContaining({
                value: existingNoteFields[1][0].value,
              }),
            }),
          ],
        }),
        expect.objectContaining({
          id: expect.any(Number),
          note: noteMock.id,
          is_archived: true,
          fields: [
            expect.objectContaining({
              side: 0,
              field: expect.objectContaining({
                value: existingNoteFields[0][0].value,
              }),
            }),
            expect.objectContaining({
              side: 1,
              field: expect.objectContaining({
                value: existingNoteFields[1][1].value,
              }),
            }),
          ],
        }),
      ])
    })
  })
})
