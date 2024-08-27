import { collection, collectionToNote } from '@/collections/schema'
import { mockDatabase } from '@/test/utils'
import { eq } from 'drizzle-orm'
import hash from 'sha.js'
import createNoteFn from '../createNote'
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
      await database.insert(noteField).values([
        {
          note: noteId,
          value: 'Field 1',
          hash: hash('sha256').update('Field 1').digest('base64'),
          position: 0,
        },
        {
          note: noteId,
          value: 'Field 2',
          hash: hash('sha256').update('Field 2').digest('base64'),
          position: 1,
        },
      ])
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

    it('is able to prepend a note field with a value that does not already exist', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [{ value: '1' }, { value: '2' }]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: existingNoteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })
      const newNoteFields = [{ value: '3' }]

      await updateNote({
        id: noteMock.id,
        fields: [...newNoteFields, ...existingNoteFields],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0].value,
          position: 1,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1].value,
          position: 2,
          is_archived: false,
        }),
        expect.objectContaining({
          value: newNoteFields[0].value,
          position: 0,
          is_archived: false,
        }),
      ])
    })

    it('is able to prepend a note field with the same value as an existing note field', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [{ value: '1' }, { value: '2' }]
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
        fields: [...newNoteFields, ...existingNoteFields],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0].value,
          position: 1,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1].value,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: newNoteFields[0].value,
          position: 2,
          is_archived: false,
        }),
      ])
    })

    it('is able to prepend a note field when at least two existing fields have the same value', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [{ value: '1' }, { value: '1' }]
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
        fields: [...newNoteFields, ...existingNoteFields],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0].value,
          position: 1,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1].value,
          position: 2,
          is_archived: false,
        }),
        expect.objectContaining({
          value: newNoteFields[0].value,
          position: 0,
          is_archived: false,
        }),
      ])
    })

    it('is able to prepend a note field with the same value as at least two existing note fields', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [{ value: '1' }, { value: '1' }]
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
        fields: [...newNoteFields, ...existingNoteFields],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0].value,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1].value,
          position: 1,
          is_archived: false,
        }),
        expect.objectContaining({
          value: newNoteFields[0].value,
          position: 2,
          is_archived: false,
        }),
      ])
    })

    it('is able to prepend multiple note fields', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [{ value: '1' }, { value: '2' }]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: existingNoteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })
      const newNoteFields = [{ value: '3' }, { value: '4' }]

      await updateNote({
        id: noteMock.id,
        fields: [...newNoteFields, ...existingNoteFields],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0].value,
          position: 2,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1].value,
          position: 3,
          is_archived: false,
        }),
        expect.objectContaining({
          value: newNoteFields[0].value,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: newNoteFields[1].value,
          position: 1,
          is_archived: false,
        }),
      ])
    })

    it('is able to append a note field with a value that does not already exist', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [{ value: '1' }, { value: '2' }]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: existingNoteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })
      const newNoteFields = [{ value: '3' }]

      await updateNote({
        id: noteMock.id,
        fields: [...existingNoteFields, ...newNoteFields],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0].value,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1].value,
          position: 1,
          is_archived: false,
        }),
        expect.objectContaining({
          value: newNoteFields[0].value,
          position: 2,
          is_archived: false,
        }),
      ])
    })

    it('is able to append a note field with the same value as an existing note field', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [{ value: '1' }, { value: '2' }]
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
        fields: [...existingNoteFields, ...newNoteFields],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0].value,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1].value,
          position: 1,
          is_archived: false,
        }),
        expect.objectContaining({
          value: newNoteFields[0].value,
          position: 2,
          is_archived: false,
        }),
      ])
    })

    it('is able to append a note field when at least two existing fields have the same value', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [{ value: '1' }, { value: '1' }]
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
        fields: [...existingNoteFields, ...newNoteFields],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0].value,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1].value,
          position: 1,
          is_archived: false,
        }),
        expect.objectContaining({
          value: newNoteFields[0].value,
          position: 2,
          is_archived: false,
        }),
      ])
    })

    it('is able to append a note field with the same value as at least two existing note fields', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [{ value: '1' }, { value: '1' }]
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
        fields: [...existingNoteFields, ...newNoteFields],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0].value,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1].value,
          position: 1,
          is_archived: false,
        }),
        expect.objectContaining({
          value: newNoteFields[0].value,
          position: 2,
          is_archived: false,
        }),
      ])
    })

    it('is able to append multiple note fields', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [{ value: '1' }, { value: '2' }]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: existingNoteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })
      const newNoteFields = [{ value: '3' }, { value: '4' }]

      await updateNote({
        id: noteMock.id,
        fields: [...existingNoteFields, ...newNoteFields],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0].value,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1].value,
          position: 1,
          is_archived: false,
        }),
        expect.objectContaining({
          value: newNoteFields[0].value,
          position: 2,
          is_archived: false,
        }),
        expect.objectContaining({
          value: newNoteFields[1].value,
          position: 3,
          is_archived: false,
        }),
      ])
    })

    it('is able to insert a note field with a value that does not already exist in between two existing note fields', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [{ value: '1' }, { value: '2' }]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: existingNoteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })
      const newNoteFields = [{ value: '3' }]

      await updateNote({
        id: noteMock.id,
        fields: [
          existingNoteFields[0],
          newNoteFields[0],
          existingNoteFields[1],
        ],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0].value,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1].value,
          position: 2,
          is_archived: false,
        }),
        expect.objectContaining({
          value: newNoteFields[0].value,
          position: 1,
          is_archived: false,
        }),
      ])
    })

    it('is able to insert a note field with the same value as an existing note field in between two existing note fields', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [{ value: '1' }, { value: '2' }]
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
          newNoteFields[0],
          existingNoteFields[1],
        ],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0].value,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1].value,
          position: 2,
          is_archived: false,
        }),
        expect.objectContaining({
          value: newNoteFields[0].value,
          position: 1,
          is_archived: false,
        }),
      ])
    })

    it('is able to insert multiple note fields between existing note fields', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [{ value: '1' }, { value: '2' }]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: existingNoteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })
      const newNoteFields = [{ value: '3' }, { value: '4' }]

      await updateNote({
        id: noteMock.id,
        fields: [
          existingNoteFields[0],
          ...newNoteFields,
          existingNoteFields[1],
        ],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0].value,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1].value,
          position: 3,
          is_archived: false,
        }),
        expect.objectContaining({
          value: newNoteFields[0].value,
          position: 1,
          is_archived: false,
        }),
        expect.objectContaining({
          value: newNoteFields[1].value,
          position: 2,
          is_archived: false,
        }),
      ])
    })

    it('is able to archive the first note field for a note', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [
        { value: '1' },
        { value: '2' },
        { value: '3' },
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
        fields: [existingNoteFields[1], existingNoteFields[2]],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0].value,
          position: 0,
          is_archived: true,
        }),
        expect.objectContaining({
          value: existingNoteFields[1].value,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[2].value,
          position: 1,
          is_archived: false,
        }),
      ])
    })

    it('is able to archive a note field that is not the first nor last for a note', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [
        { value: '1' },
        { value: '2' },
        { value: '3' },
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
        fields: [existingNoteFields[0], existingNoteFields[2]],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0].value,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1].value,
          position: 1,
          is_archived: true,
        }),
        expect.objectContaining({
          value: existingNoteFields[2].value,
          position: 1,
          is_archived: false,
        }),
      ])
    })

    it('is able to archive the last note field for a note', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [
        { value: '1' },
        { value: '2' },
        { value: '3' },
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
        fields: [existingNoteFields[0], existingNoteFields[1]],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0].value,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1].value,
          position: 1,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[2].value,
          position: 2,
          is_archived: true,
        }),
      ])
    })

    it('is able to archive a note field when another note field has the same value', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [
        { value: '1' },
        { value: '2' },
        { value: '1' },
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
        fields: [existingNoteFields[0], existingNoteFields[1]],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0].value,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1].value,
          position: 1,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[2].value,
          position: 2,
          is_archived: true,
        }),
      ])
    })

    it('is able to archive multiple note fields', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [
        { value: '1' },
        { value: '2' },
        { value: '3' },
        { value: '4' },
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
        fields: [existingNoteFields[0], existingNoteFields[1]],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0].value,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1].value,
          position: 1,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[2].value,
          position: 2,
          is_archived: true,
        }),
        expect.objectContaining({
          value: existingNoteFields[3].value,
          position: 3,
          is_archived: true,
        }),
      ])
    })

    it('is able to swap the positions of two note fields', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [
        { value: '1' },
        { value: '2' },
        { value: '3' },
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
          existingNoteFields[2],
          existingNoteFields[1],
        ],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0].value,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1].value,
          position: 2,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[2].value,
          position: 1,
          is_archived: false,
        }),
      ])
    })

    it('is able to replace the value of the first note field', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [{ value: '1' }, { value: '2' }]
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
        fields: [newNoteFields[0], existingNoteFields[1]],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0].value,
          position: 0,
          is_archived: true,
        }),
        expect.objectContaining({
          value: existingNoteFields[1].value,
          position: 1,
          is_archived: false,
        }),
        expect.objectContaining({
          value: newNoteFields[0].value,
          position: 0,
          is_archived: false,
        }),
      ])
    })

    it('is able to replace the value of a note field that is neither the first nor last', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [
        { value: '1' },
        { value: '2' },
        { value: '3' },
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
          newNoteFields[0],
          existingNoteFields[2],
        ],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0].value,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1].value,
          position: 1,
          is_archived: true,
        }),
        expect.objectContaining({
          value: existingNoteFields[2].value,
          position: 2,
          is_archived: false,
        }),
        expect.objectContaining({
          value: newNoteFields[0].value,
          position: 1,
          is_archived: false,
        }),
      ])
    })

    it('is able to replace the value of the last note field', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [{ value: '1' }, { value: '2' }]
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
        fields: [existingNoteFields[0], newNoteFields[0]],
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0].value,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1].value,
          position: 1,
          is_archived: true,
        }),
        expect.objectContaining({
          value: newNoteFields[0].value,
          position: 1,
          is_archived: false,
        }),
      ])
    })

    it('is able to replace multiple note fields', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [{ value: '1' }, { value: '2' }]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: existingNoteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })
      const newNoteFields = [{ value: '1a' }, { value: '2a' }]

      await updateNote({
        id: noteMock.id,
        fields: newNoteFields,
      })

      const noteFields = await database.select().from(noteField)

      expect(noteFields).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0].value,
          position: 0,
          is_archived: true,
        }),
        expect.objectContaining({
          value: existingNoteFields[1].value,
          position: 1,
          is_archived: true,
        }),
        expect.objectContaining({
          value: newNoteFields[0].value,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: newNoteFields[1].value,
          position: 1,
          is_archived: false,
        }),
      ])
    })

    it('is able to un-archive the first note field', async () => {
      const { default: updateNote } = await import('.')
      const noteFields = [{ value: '1' }, { value: '2' }, { value: '3' }]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: noteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })
      // Archive the first note field
      await updateNote({
        id: noteMock.id,
        fields: [noteFields[1], noteFields[2]],
      })

      await updateNote({
        id: noteMock.id,
        fields: noteFields,
      })

      const noteFieldsState = await database.select().from(noteField)

      expect(noteFieldsState).toEqual([
        expect.objectContaining({
          value: noteFields[0].value,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: noteFields[1].value,
          position: 1,
          is_archived: false,
        }),
        expect.objectContaining({
          value: noteFields[2].value,
          position: 2,
          is_archived: false,
        }),
      ])
    })

    it('is able to un-archive a note field that is neither the first nor last', async () => {
      const { default: updateNote } = await import('.')
      const noteFields = [{ value: '1' }, { value: '2' }, { value: '3' }]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: noteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })
      // Archive the first note field
      await updateNote({
        id: noteMock.id,
        fields: [noteFields[0], noteFields[2]],
      })

      await updateNote({
        id: noteMock.id,
        fields: noteFields,
      })

      const noteFieldsState = await database.select().from(noteField)

      expect(noteFieldsState).toEqual([
        expect.objectContaining({
          value: noteFields[0].value,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: noteFields[1].value,
          position: 1,
          is_archived: false,
        }),
        expect.objectContaining({
          value: noteFields[2].value,
          position: 2,
          is_archived: false,
        }),
      ])
    })

    it('is able to un-archive the last note field', async () => {
      const { default: updateNote } = await import('.')
      const noteFields = [{ value: '1' }, { value: '2' }, { value: '3' }]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: noteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })
      // Archive the first note field
      await updateNote({
        id: noteMock.id,
        fields: [noteFields[0], noteFields[1]],
      })

      await updateNote({
        id: noteMock.id,
        fields: noteFields,
      })

      const noteFieldsState = await database.select().from(noteField)

      expect(noteFieldsState).toEqual([
        expect.objectContaining({
          value: noteFields[0].value,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: noteFields[1].value,
          position: 1,
          is_archived: false,
        }),
        expect.objectContaining({
          value: noteFields[2].value,
          position: 2,
          is_archived: false,
        }),
      ])
    })

    it('is able to un-archive and swap positions of note fields together', async () => {
      const { default: updateNote } = await import('.')
      const noteFields = [{ value: '1' }, { value: '2' }, { value: '3' }]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: noteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })
      // Archive the first note field
      await updateNote({
        id: noteMock.id,
        fields: [noteFields[1], noteFields[2]],
      })

      await updateNote({
        id: noteMock.id,
        fields: [noteFields[1], noteFields[0], noteFields[2]],
      })

      const noteFieldsState = await database.select().from(noteField)

      expect(noteFieldsState).toEqual([
        expect.objectContaining({
          value: noteFields[0].value,
          position: 1,
          is_archived: false,
        }),
        expect.objectContaining({
          value: noteFields[1].value,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: noteFields[2].value,
          position: 2,
          is_archived: false,
        }),
      ])
    })

    it('is able to un-archive and replace note fields together', async () => {
      const { default: updateNote } = await import('.')
      const existingNoteFields = [
        { value: '1' },
        { value: '2' },
        { value: '3' },
      ]
      const noteMock = await createNote({
        collections: [collectionMock.id],
        fields: existingNoteFields,
        config: {
          reversible: false,
          separable: false,
        },
      })
      // Archive the first note field
      await updateNote({
        id: noteMock.id,
        fields: [existingNoteFields[1], existingNoteFields[2]],
      })

      const newNoteFields = [{ value: '2a' }, { value: '3a' }]

      await updateNote({
        id: noteMock.id,
        fields: [newNoteFields[0], existingNoteFields[0], newNoteFields[1]],
      })

      const noteFieldsState = await database.select().from(noteField)

      expect(noteFieldsState).toEqual([
        expect.objectContaining({
          value: existingNoteFields[0].value,
          position: 1,
          is_archived: false,
        }),
        expect.objectContaining({
          value: existingNoteFields[1].value,
          position: 0,
          is_archived: true,
        }),
        expect.objectContaining({
          value: existingNoteFields[2].value,
          position: 1,
          is_archived: true,
        }),
        expect.objectContaining({
          value: newNoteFields[0].value,
          position: 0,
          is_archived: false,
        }),
        expect.objectContaining({
          value: newNoteFields[1].value,
          position: 2,
          is_archived: false,
        }),
      ])
    })
  })
})
