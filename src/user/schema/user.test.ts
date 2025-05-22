import { mockDatabase } from 'test/utils'
import { User, UserParameters, user } from './user'

type DatabaseMock = Awaited<ReturnType<typeof mockDatabase>>
type Any<Type> = {
  [Property in keyof Type]: any
}

describe('`user` table', () => {
  let database: DatabaseMock['database'],
    resetDatabaseMock: DatabaseMock['resetDatabaseMock'],
    insertUser: (values: Any<UserParameters>) => Promise<User>

  beforeEach(async () => {
    ;({ database, resetDatabaseMock } = await mockDatabase())

    insertUser = async (values) =>
      (await database.insert(user).values(values).returning())[0]
  })

  afterEach(() => {
    resetDatabaseMock()
  })

  describe('`id` column', () => {
    it('is an integer', async () => {
      const datatypeMismatch = expect.objectContaining({
        message: expect.stringContaining('datatype mismatch'),
      })

      await expect(insertUser({ id: 'string' })).rejects.toEqual(
        datatypeMismatch,
      )
      await expect(insertUser({ id: 0.1 })).rejects.toEqual(datatypeMismatch)
      await expect(insertUser({ id: 1 })).resolves.toEqual(
        expect.objectContaining({ id: expect.any(Number) }),
      )
    })

    it('cannot be `null`', async () => {
      await expect(insertUser({ id: undefined })).resolves.toEqual(
        expect.objectContaining({ id: expect.any(Number) }),
      )
      await expect(insertUser({ id: null })).resolves.toEqual(
        expect.objectContaining({ id: expect.any(Number) }),
      )
    })

    it('auto-increments', async () => {
      const output = [await insertUser({}), await insertUser({})]

      expect(output).toEqual([
        expect.objectContaining({ id: 1 }),
        expect.objectContaining({ id: 2 }),
      ])
    })
  })

  describe('`active_collection` column', () => {
    test('when not `null`, must reference a collection', async () => {
      await expect(insertUser({ activeCollection: 0 })).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining('FOREIGN KEY constraint failed'),
        }),
      )
    })

    it('can be `null`', async () => {
      await expect(insertUser({ activeCollection: null })).toResolve()
    })
  })

  describe('`is_onboarded` column', () => {
    it('is a boolean', async () => {
      const insertUserWithIsOnboarded = async (onboarded: any) =>
        (await insertUser({ onboarded })).onboarded

      await expect(insertUserWithIsOnboarded(true)).resolves.toBeTrue()
      await expect(insertUserWithIsOnboarded(1)).resolves.toBeTrue()
      await expect(insertUserWithIsOnboarded(0.1)).resolves.toBeTrue()
      await expect(insertUserWithIsOnboarded('string')).resolves.toBeTrue()
      await expect(insertUserWithIsOnboarded([])).resolves.toBeTrue()
      await expect(insertUserWithIsOnboarded({})).resolves.toBeTrue()
      await expect(insertUserWithIsOnboarded(0)).resolves.toBeFalse()
      await expect(insertUserWithIsOnboarded(false)).resolves.toBeFalse()
    })

    it('cannot be `null`', async () => {
      await expect(
        insertUser({
          onboarded: null,
        }),
      ).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: user.is_onboarded',
          ),
        }),
      )
    })

    it('defaults to `false`', async () => {
      expect(
        (
          await insertUser({
            onboarded: undefined,
          })
        ).onboarded,
      ).toBeFalse()
    })
  })

  describe('`created_at` column', () => {
    it('is a date', async () => {
      const now = new Date()

      await expect(() => insertUser({ createdAt: 'string' })).rejects.toThrow()
      await expect(() => insertUser({ createdAt: 0.1 })).rejects.toThrow()
      await expect(() => insertUser({ createdAt: 1 })).rejects.toThrow()
      await expect(insertUser({ createdAt: now })).resolves.toEqual(
        expect.objectContaining({
          createdAt: now,
        }),
      )
    })

    it('defaults to _now_', async () => {
      const { createdAt } = await insertUser({})

      // The `created_at` datetime is determined in the database and not something that can be mocked.
      // Expect it to be within 1000 ms of when the assertion is executed.
      expect(createdAt).toBeBetween(
        new Date(new Date().valueOf() - 1000),
        new Date(),
      )
    })

    it('cannot be `null`', async () => {
      await expect(insertUser({ createdAt: null })).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: user.created_at',
          ),
        }),
      )
    })
  })
})
