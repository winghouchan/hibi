import { mockDatabase } from '@/test/utils'
import { collection } from './collection'

describe('`collection` table', () => {
  describe('`id` column', () => {
    it('is an integer', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const insertCollection = async ({ id }: { id: any }) =>
        (
          await database
            .insert(collection)
            .values({ id, name: 'Collection 1' })
            .returning({ id: collection.id })
        )[0]

      await expect(insertCollection({ id: 'string' })).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining('datatype mismatch'),
        }),
      )
      await expect(insertCollection({ id: 0.1 })).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining('datatype mismatch'),
        }),
      )
      await expect(insertCollection({ id: 1 })).resolves.toEqual({ id: 1 })

      resetDatabaseMock()
    })

    it('cannot be `null`', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const insertCollectionWithNullId = async () =>
        (
          await database
            .insert(collection)
            .values({
              // Cast `null` to `number` so that compile time checks pass and run time checks can be tested
              id: null as unknown as number,
              name: 'Collection 1',
            })
            .returning({ id: collection.id })
        )[0]

      const output = await insertCollectionWithNullId()

      expect(output).toEqual({ id: 1 })

      resetDatabaseMock()
    })

    it('auto-increments', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const insertCollection = async (name: string) =>
        (
          await database
            .insert(collection)
            .values({ name })
            .returning({ id: collection.id })
        )[0]

      const output = [
        await insertCollection('Collection 1'),
        await insertCollection('Collection 2'),
      ]

      expect(output).toEqual([{ id: 1 }, { id: 2 }])

      resetDatabaseMock()
    })
  })

  describe('`name` column', () => {
    it('is a string', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const insertCollection = async ({ name }: { name: any }) =>
        (
          await database
            .insert(collection)
            .values({ name })
            .returning({ name: collection.name })
        )[0]

      await expect(insertCollection({ name: 0.1 })).resolves.toEqual({
        name: '0.1',
      })
      await expect(insertCollection({ name: 1 })).resolves.toEqual({
        name: '1.0',
      })
      await expect(insertCollection({ name: 'string' })).resolves.toEqual({
        name: 'string',
      })

      resetDatabaseMock()
    })

    it('cannot be `null`', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const insertCollectionWithNullName = async () =>
        await database.insert(collection).values({
          // Cast `null` to `string` so that compile time checks pass and run time checks can be tested
          name: null as unknown as string,
        })

      await expect(insertCollectionWithNullName).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: collection.name',
          ),
        }),
      )

      resetDatabaseMock()
    })

    it('cannot be an empty string', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const insertCollectionWithEmptyName = async () =>
        await database.insert(collection).values({ name: '' })

      await expect(insertCollectionWithEmptyName).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining('CHECK constraint failed: name'),
        }),
      )

      resetDatabaseMock()
    })
  })

  describe('`created_at` column', () => {
    it('is a date', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const insertCollection = async ({ created_at }: { created_at: any }) =>
        (
          await database
            .insert(collection)
            .values({ created_at, name: 'Collection 1' })
            .returning({ createdAt: collection.created_at })
        )[0]
      const now = new Date()

      await expect(() =>
        insertCollection({ created_at: 'string' }),
      ).rejects.toThrow()
      await expect(() =>
        insertCollection({ created_at: 0.1 }),
      ).rejects.toThrow()
      await expect(() => insertCollection({ created_at: 1 })).rejects.toThrow()
      await expect(insertCollection({ created_at: now })).resolves.toEqual({
        createdAt: now,
      })

      resetDatabaseMock()
    })

    it('defaults to _now_', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const insertCollection = async () =>
        (
          await database
            .insert(collection)
            .values({ name: 'Collection 1' })
            .returning({ createdAt: collection.created_at })
        )[0]

      const { createdAt } = await insertCollection()

      // The `created_at` datetime is determined in the database and not something that can be mocked.
      // Expect it to be within 1000 ms of when the assertion is executed.
      expect(createdAt).toBeBetween(
        new Date(new Date().valueOf() - 1000),
        new Date(),
      )

      resetDatabaseMock()
    })

    it('cannot be `null`', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const insertCollectionWithNullCreatedAt = async () =>
        await database.insert(collection).values({
          // Cast `null` to `Date` so that compile time checks pass and run time checks can be tested
          created_at: null as unknown as Date,
          name: 'Collection 1',
        })

      await expect(insertCollectionWithNullCreatedAt).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: collection.created_at',
          ),
        }),
      )

      resetDatabaseMock()
    })
  })
})
