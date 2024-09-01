import hashNoteFieldValue from '@/notes/hashNoteFieldValue'
import { note, noteField } from '@/notes/schema'
import { mockDatabase } from '@/test/utils'
import { reviewable, reviewableField } from './reviewable'

type DatabaseMock = Awaited<ReturnType<typeof mockDatabase>>
type Any<Type> = {
  [Property in keyof Type]: any
}

describe('`reviewable` table', () => {
  let database: DatabaseMock['database'],
    resetDatabaseMock: DatabaseMock['resetDatabaseMock'],
    reviewableMock: Pick<typeof reviewable.$inferInsert, 'note'>,
    insertReviewable: (
      values: Any<typeof reviewable.$inferInsert>,
    ) => Promise<typeof reviewable.$inferSelect>

  beforeEach(async () => {
    ;({ database, resetDatabaseMock } = await mockDatabase())

    const [{ noteId }] = await database
      .insert(note)
      .values({})
      .returning({ noteId: note.id })

    reviewableMock = {
      note: noteId,
    }

    insertReviewable = async (values) =>
      (await database.insert(reviewable).values(values).returning())[0]
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
        insertReviewable({ ...reviewableMock, id: 'string' }),
      ).rejects.toEqual(datatypeMismatch)
      await expect(
        insertReviewable({ ...reviewableMock, id: 0.1 }),
      ).rejects.toEqual(datatypeMismatch)
      await expect(
        insertReviewable({ ...reviewableMock, id: 1 }),
      ).resolves.toEqual(
        expect.objectContaining({
          id: expect.any(Number),
        }),
      )
    })

    it('cannot be `null`', async () => {
      await expect(
        insertReviewable({ ...reviewableMock, id: undefined }),
      ).resolves.toEqual(expect.objectContaining({ id: expect.any(Number) }))
      await expect(
        insertReviewable({ ...reviewableMock, id: null }),
      ).resolves.toEqual(expect.objectContaining({ id: expect.any(Number) }))
    })

    it('auto-increments', async () => {
      const output = [
        await insertReviewable(reviewableMock),
        await insertReviewable(reviewableMock),
      ]

      expect(output).toEqual([
        expect.objectContaining({ id: 1 }),
        expect.objectContaining({ id: 2 }),
      ])
    })
  })

  describe('`note` column', () => {
    it('must reference a note', async () => {
      await expect(
        insertReviewable({ ...reviewableMock, note: 0 }),
      ).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining('FOREIGN KEY constraint failed'),
        }),
      )
    })

    it('cannot be `null`', async () => {
      const notNullConstraintFailed = expect.objectContaining({
        message: expect.stringContaining(
          'NOT NULL constraint failed: reviewable.note',
        ),
      })

      await expect(
        insertReviewable({ ...reviewableMock, note: undefined }),
      ).rejects.toEqual(notNullConstraintFailed)
      await expect(
        insertReviewable({ ...reviewableMock, note: null }),
      ).rejects.toEqual(notNullConstraintFailed)
    })
  })

  describe('`is_archived` column', () => {
    it('is a boolean', async () => {
      const insertReviewableWithIsArchived = async (is_archived: any) =>
        (await insertReviewable({ ...reviewableMock, is_archived })).is_archived

      await expect(insertReviewableWithIsArchived(true)).resolves.toBeTrue()
      await expect(insertReviewableWithIsArchived(1)).resolves.toBeTrue()
      await expect(insertReviewableWithIsArchived(0.1)).resolves.toBeTrue()
      await expect(insertReviewableWithIsArchived('string')).resolves.toBeTrue()
      await expect(insertReviewableWithIsArchived([])).resolves.toBeTrue()
      await expect(insertReviewableWithIsArchived({})).resolves.toBeTrue()
      await expect(insertReviewableWithIsArchived(0)).resolves.toBeFalse()
      await expect(insertReviewableWithIsArchived(false)).resolves.toBeFalse()
    })

    it('cannot be `null`', async () => {
      await expect(
        insertReviewable({
          ...reviewableMock,
          is_archived: null,
        }),
      ).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: reviewable.is_archived',
          ),
        }),
      )
    })

    it('defaults to `false`', async () => {
      expect(
        (
          await insertReviewable({
            ...reviewableMock,
            is_archived: undefined,
          })
        ).is_archived,
      ).toBeFalse()
    })
  })

  describe('`created_at` column', () => {
    it('is a date', async () => {
      const now = new Date()

      await expect(
        insertReviewable({ ...reviewableMock, created_at: 'string' }),
      ).rejects.toThrow()
      await expect(
        insertReviewable({ ...reviewableMock, created_at: 0.1 }),
      ).rejects.toThrow()
      await expect(
        insertReviewable({ ...reviewableMock, created_at: 1 }),
      ).rejects.toThrow()
      await expect(
        insertReviewable({ ...reviewableMock, created_at: now }),
      ).resolves.toEqual(
        expect.objectContaining({
          created_at: now,
        }),
      )
    })

    it('defaults to _now_', async () => {
      const { created_at } = await insertReviewable(reviewableMock)

      // The `created_at` datetime is determined in the database and not something that can be mocked.
      // Expect it to be within 1000 ms of when the assertion is executed.
      expect(created_at).toBeBetween(
        new Date(new Date().valueOf() - 1000),
        new Date(),
      )
    })

    it('cannot be `null`', async () => {
      await expect(
        insertReviewable({ ...reviewableMock, created_at: null }),
      ).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: reviewable.created_at',
          ),
        }),
      )
    })
  })
})

describe('`reviewable_field` table', () => {
  let database: DatabaseMock['database'],
    resetDatabaseMock: DatabaseMock['resetDatabaseMock'],
    reviewableFieldMock: Pick<
      typeof reviewableField.$inferInsert,
      'reviewable' | 'field' | 'side'
    >,
    insertReviewableField: (
      values: Any<typeof reviewableField.$inferInsert>,
    ) => Promise<typeof reviewableField.$inferSelect>

  beforeEach(async () => {
    ;({ database, resetDatabaseMock } = await mockDatabase())

    const [{ noteId }] = await database
      .insert(note)
      .values({})
      .returning({ noteId: note.id })

    const [{ reviewableId }] = await database
      .insert(reviewable)
      .values({ note: noteId })
      .returning({ reviewableId: reviewable.id })

    const [{ fieldId }] = await database
      .insert(noteField)
      .values(
        ['Field 1'].map((value, position) => ({
          note: noteId,
          value,
          hash: hashNoteFieldValue(value),
          position,
          side: 0,
        })),
      )
      .returning({ fieldId: noteField.id })

    reviewableFieldMock = {
      reviewable: reviewableId,
      field: fieldId,
      side: 0,
    }

    insertReviewableField = async (values) =>
      (await database.insert(reviewableField).values(values).returning())[0]
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
        insertReviewableField({ ...reviewableFieldMock, id: 'string' }),
      ).rejects.toEqual(datatypeMismatch)
      await expect(
        insertReviewableField({ ...reviewableFieldMock, id: 0.1 }),
      ).rejects.toEqual(datatypeMismatch)
      await expect(
        insertReviewableField({ ...reviewableFieldMock, id: 1 }),
      ).resolves.toEqual(
        expect.objectContaining({
          id: expect.any(Number),
        }),
      )
    })

    it('cannot be `null`', async () => {
      await expect(
        insertReviewableField({ ...reviewableFieldMock, id: undefined }),
      ).resolves.toEqual(expect.objectContaining({ id: expect.any(Number) }))
      await expect(
        insertReviewableField({ ...reviewableFieldMock, id: null }),
      ).resolves.toEqual(expect.objectContaining({ id: expect.any(Number) }))
    })

    it('auto-increments', async () => {
      const output = [
        await insertReviewableField(reviewableFieldMock),
        await insertReviewableField(reviewableFieldMock),
      ]

      expect(output).toEqual([
        expect.objectContaining({ id: 1 }),
        expect.objectContaining({ id: 2 }),
      ])
    })
  })

  describe('`reviewable` column', () => {
    it('must reference a reviewable', async () => {
      await expect(
        insertReviewableField({ ...reviewableFieldMock, reviewable: 0 }),
      ).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining('FOREIGN KEY constraint failed'),
        }),
      )
    })

    it('cannot be `null`', async () => {
      const notNullConstraintFailed = expect.objectContaining({
        message: expect.stringContaining(
          'NOT NULL constraint failed: reviewable_field.reviewable',
        ),
      })

      await expect(
        insertReviewableField({
          ...reviewableFieldMock,
          reviewable: undefined,
        }),
      ).rejects.toEqual(notNullConstraintFailed)
      await expect(
        insertReviewableField({ ...reviewableFieldMock, reviewable: null }),
      ).rejects.toEqual(notNullConstraintFailed)
    })
  })

  describe('`field` column', () => {
    it('must reference a field', async () => {
      await expect(
        insertReviewableField({ ...reviewableFieldMock, field: 0 }),
      ).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining('FOREIGN KEY constraint failed'),
        }),
      )
    })

    it('cannot be `null`', async () => {
      const notNullConstraintFailed = expect.objectContaining({
        message: expect.stringContaining(
          'NOT NULL constraint failed: reviewable_field.field',
        ),
      })

      await expect(
        insertReviewableField({
          ...reviewableFieldMock,
          field: undefined,
        }),
      ).rejects.toEqual(notNullConstraintFailed)
      await expect(
        insertReviewableField({ ...reviewableFieldMock, field: null }),
      ).rejects.toEqual(notNullConstraintFailed)
    })
  })

  describe('`side` column', () => {
    it('is either 0 or 1', async () => {
      const checkConstraintFailed = expect.objectContaining({
        message: expect.stringContaining('CHECK constraint failed: side'),
      })

      await expect(
        insertReviewableField({ ...reviewableFieldMock, side: -1 }),
      ).rejects.toEqual(checkConstraintFailed)
      await expect(
        insertReviewableField({ ...reviewableFieldMock, side: 0 }),
      ).toResolve()
      await expect(
        insertReviewableField({ ...reviewableFieldMock, side: 1 }),
      ).toResolve()
      await expect(
        insertReviewableField({ ...reviewableFieldMock, side: 2 }),
      ).rejects.toEqual(checkConstraintFailed)
    })

    it('cannot be `null`', async () => {
      const notNullConstraintFailed = expect.objectContaining({
        message: expect.stringContaining(
          'NOT NULL constraint failed: reviewable_field.side',
        ),
      })

      await expect(
        insertReviewableField({ ...reviewableFieldMock, side: undefined }),
      ).rejects.toEqual(notNullConstraintFailed)
      await expect(
        insertReviewableField({ ...reviewableFieldMock, side: null }),
      ).rejects.toEqual(notNullConstraintFailed)
    })
  })

  describe('`created_at` column', () => {
    it('is a date', async () => {
      const now = new Date()

      await expect(
        insertReviewableField({ ...reviewableFieldMock, created_at: 'string' }),
      ).rejects.toThrow()
      await expect(
        insertReviewableField({ ...reviewableFieldMock, created_at: 0.1 }),
      ).rejects.toThrow()
      await expect(
        insertReviewableField({ ...reviewableFieldMock, created_at: 1 }),
      ).rejects.toThrow()
      await expect(
        insertReviewableField({ ...reviewableFieldMock, created_at: now }),
      ).resolves.toEqual(
        expect.objectContaining({
          created_at: now,
        }),
      )
    })

    it('defaults to _now_', async () => {
      const { created_at } = await insertReviewableField(reviewableFieldMock)

      // The `created_at` datetime is determined in the database and not something that can be mocked.
      // Expect it to be within 1000 ms of when the assertion is executed.
      expect(created_at).toBeBetween(
        new Date(new Date().valueOf() - 1000),
        new Date(),
      )
    })

    it('cannot be `null`', async () => {
      await expect(
        insertReviewableField({ ...reviewableFieldMock, created_at: null }),
      ).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: reviewable_field.created_at',
          ),
        }),
      )
    })
  })
})
