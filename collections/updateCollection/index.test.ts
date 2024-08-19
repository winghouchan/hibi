import { mockDatabase } from '@/test/utils'
import { eq } from 'drizzle-orm'
import { collection } from '../schema'

describe('updateCollection', () => {
  describe('when given a collection to update', () => {
    it('updates it with the new data', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const [collectionToUpdate] = await database
        .insert(collection)
        .values({ name: 'Collection Name' })
        .returning()
      const { default: updateCollection } = await import('.')
      const input = { id: collectionToUpdate.id, name: 'New Collection Name' }

      await updateCollection(input)
      const output = await database.query.collection.findMany()

      expect(output).toHaveLength(1)
      expect(output[0]).toHaveProperty('id', collectionToUpdate.id)
      expect(output[0]).toHaveProperty('name', input.name)
      expect(output[0]).toHaveProperty(
        'created_at',
        collectionToUpdate.created_at,
      )

      resetDatabaseMock()
    })

    it('returns the updated collection', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const [collectionToUpdate] = await database
        .insert(collection)
        .values({ name: 'Collection Name' })
        .returning()
      const { default: updateCollection } = await import('.')
      const input = { id: collectionToUpdate.id, name: 'New Collection Name' }

      const output = await updateCollection(input)

      expect(output).toHaveProperty('id', collectionToUpdate.id)
      expect(output).toHaveProperty('name', input.name)
      expect(output).toHaveProperty('created_at', collectionToUpdate.created_at)

      resetDatabaseMock()
    })

    it('does not alter other collections', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const [collectionToUpdate] = await database
        .insert(collection)
        .values({ name: 'Collection 1' })
        .returning()
      const [collectionToNotUpdate] = await database
        .insert(collection)
        .values({ name: 'Collection 1' })
        .returning()
      const { default: updateCollection } = await import('.')
      const input = { id: collectionToUpdate.id, name: 'New Collection Name' }

      await updateCollection(input)
      const output = await database.query.collection.findFirst({
        where: eq(collection.id, collectionToNotUpdate.id),
      })

      expect(output).toHaveProperty('id', collectionToNotUpdate.id)
      expect(output).toHaveProperty('name', collectionToNotUpdate.name)
      expect(output).toHaveProperty(
        'created_at',
        collectionToNotUpdate.created_at,
      )

      resetDatabaseMock()
    })
  })

  describe('when given a non-existent collection to update', () => {
    it('returns `undefined`', async () => {
      const { resetDatabaseMock } = await mockDatabase()
      const { default: updateCollection } = await import('.')
      const input = { id: 0, name: 'New Collection Name' }

      await expect(updateCollection(input)).resolves.toBeUndefined()

      resetDatabaseMock()
    })

    it('does not alter other collections', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const [collectionToNotUpdate] = await database
        .insert(collection)
        .values({ name: 'Collection 1' })
        .returning()
      const { default: updateCollection } = await import('.')
      const input = { id: 0, name: 'New Collection Name' }

      await updateCollection(input)
      const output = await database.query.collection.findFirst({
        where: eq(collection.id, collectionToNotUpdate.id),
      })

      expect(output).toHaveProperty('id', collectionToNotUpdate.id)
      expect(output).toHaveProperty('name', collectionToNotUpdate.name)
      expect(output).toHaveProperty(
        'created_at',
        collectionToNotUpdate.created_at,
      )

      resetDatabaseMock()
    })
  })
})
