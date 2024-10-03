import { mockDatabase } from 'test/utils'
import { collection } from './collection'

type DatabaseMock = Awaited<ReturnType<typeof mockDatabase>>
type Any<Type> = {
  [Property in keyof Type]: any
}

const collectionMock = {
  name: 'Collection 1',
}

describe('`collection` table', () => {
  let database: DatabaseMock['database'],
    resetDatabaseMock: DatabaseMock['resetDatabaseMock'],
    insertCollection: (
      values: Any<typeof collection.$inferInsert>,
    ) => Promise<typeof collection.$inferSelect>

  beforeEach(async () => {
    ;({ database, resetDatabaseMock } = await mockDatabase())

    insertCollection = async (values) =>
      (await database.insert(collection).values(values).returning())[0]
  })

  afterEach(() => {
    resetDatabaseMock()
  })

  describe('`id` column', () => {
    it('is an integer', async () => {
      const datatypeMismatch = expect.objectContaining({
        message: expect.stringContaining('datatype mismatch'),
      })

      await expect(
        insertCollection({ ...collectionMock, id: 'string' }),
      ).rejects.toEqual(datatypeMismatch)
      await expect(
        insertCollection({ ...collectionMock, id: 0.1 }),
      ).rejects.toEqual(datatypeMismatch)
      await expect(
        insertCollection({ ...collectionMock, id: 1 }),
      ).resolves.toEqual(expect.objectContaining({ id: expect.any(Number) }))
    })

    it('cannot be `null`', async () => {
      await expect(
        insertCollection({ ...collectionMock, id: undefined }),
      ).resolves.toEqual(expect.objectContaining({ id: expect.any(Number) }))
      await expect(
        insertCollection({ ...collectionMock, id: null }),
      ).resolves.toEqual(expect.objectContaining({ id: expect.any(Number) }))
    })

    it('auto-increments', async () => {
      const output = [
        await insertCollection({ name: 'Collection 1' }),
        await insertCollection({ name: 'Collection 2' }),
      ]

      expect(output).toEqual([
        expect.objectContaining({ id: 1 }),
        expect.objectContaining({ id: 2 }),
      ])
    })
  })

  describe('`name` column', () => {
    it('is a string', async () => {
      await expect(insertCollection({ name: 0.1 })).resolves.toEqual(
        expect.objectContaining({
          name: '0.1',
        }),
      )
      await expect(insertCollection({ name: 1 })).resolves.toEqual(
        expect.objectContaining({
          name: '1.0',
        }),
      )
      await expect(insertCollection({ name: 'string' })).resolves.toEqual(
        expect.objectContaining({
          name: 'string',
        }),
      )
    })

    it('cannot be `null`', async () => {
      const notNullConstraintFailed = expect.objectContaining({
        message: expect.stringContaining(
          'NOT NULL constraint failed: collection.name',
        ),
      })

      await expect(insertCollection({ name: undefined })).rejects.toEqual(
        notNullConstraintFailed,
      )
      await expect(insertCollection({ name: null })).rejects.toEqual(
        notNullConstraintFailed,
      )
    })

    it('cannot be an empty string', async () => {
      await expect(insertCollection({ name: '' })).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining('CHECK constraint failed: name'),
        }),
      )
    })
  })

  describe('`created_at` column', () => {
    it('is a date', async () => {
      const now = new Date()

      await expect(() =>
        insertCollection({ ...collectionMock, createdAt: 'string' }),
      ).rejects.toThrow()
      await expect(() =>
        insertCollection({ ...collectionMock, createdAt: 0.1 }),
      ).rejects.toThrow()
      await expect(() =>
        insertCollection({ ...collectionMock, createdAt: 1 }),
      ).rejects.toThrow()
      await expect(
        insertCollection({ ...collectionMock, createdAt: now }),
      ).resolves.toEqual(
        expect.objectContaining({
          createdAt: now,
        }),
      )
    })

    it('defaults to _now_', async () => {
      const { createdAt } = await insertCollection(collectionMock)

      // The `created_at` datetime is determined in the database and not something that can be mocked.
      // Expect it to be within 1000 ms of when the assertion is executed.
      expect(createdAt).toBeBetween(
        new Date(new Date().valueOf() - 1000),
        new Date(),
      )
    })

    it('cannot be `null`', async () => {
      await expect(
        insertCollection({ ...collectionMock, createdAt: null }),
      ).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: collection.created_at',
          ),
        }),
      )
    })
  })
})
