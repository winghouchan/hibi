import { collection, collectionToNote } from '@/collections/schema'
import { mockDatabase } from '@/test/utils'
import { eq } from 'drizzle-orm'
import { note } from '../schema'

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
})
