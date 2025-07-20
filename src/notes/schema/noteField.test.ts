import { mockDatabase } from 'test/utils'
import hashNoteFieldValue from '../hashNoteFieldValue'
import { note } from './note'
import { noteField } from './noteField'

type DatabaseMock = Awaited<ReturnType<typeof mockDatabase>>
type Any<Type> = {
  [Property in keyof Type]: any
}

describe('`note_field` table', () => {
  let database: DatabaseMock['database'],
    resetDatabaseMock: DatabaseMock['resetDatabaseMock'],
    insertNoteField: (
      values: Any<typeof noteField.$inferInsert>,
    ) => Promise<typeof noteField.$inferSelect>,
    generateNoteFieldMock: () => Pick<
      typeof noteField.$inferSelect,
      'hash' | 'note' | 'value' | 'position' | 'side'
    >

  beforeEach(async () => {
    ;({ database, resetDatabaseMock } = await mockDatabase())

    const [{ noteId }] = await database
      .insert(note)
      .values({})
      .returning({ noteId: note.id })

    generateNoteFieldMock = () => {
      const value = 'Note Field Value'

      return {
        note: noteId,
        value,
        hash: hashNoteFieldValue(value),
        position: 0,
        side: 0,
      }
    }

    insertNoteField = async (values) =>
      (await database.insert(noteField).values(values).returning())[0]
  })

  afterEach(() => {
    resetDatabaseMock()
  })

  describe('`id` column', () => {
    it('is an integer', async () => {
      const datatypeMismatch = expect.objectContaining({
        cause: expect.objectContaining({
          message: expect.stringContaining('datatype mismatch'),
        }),
      })

      await expect(
        insertNoteField({ ...generateNoteFieldMock(), id: 'string' }),
      ).rejects.toEqual(datatypeMismatch)
      await expect(
        insertNoteField({ ...generateNoteFieldMock(), id: 0.1 }),
      ).rejects.toEqual(datatypeMismatch)
      await expect(
        insertNoteField({ ...generateNoteFieldMock(), id: 1 }),
      ).resolves.toEqual(expect.objectContaining({ id: expect.any(Number) }))
    })

    it('cannot be `null`', async () => {
      await expect(
        insertNoteField({ ...generateNoteFieldMock(), id: undefined }),
      ).resolves.toEqual(expect.objectContaining({ id: expect.any(Number) }))
      await expect(
        insertNoteField({ ...generateNoteFieldMock(), id: null }),
      ).resolves.toEqual(expect.objectContaining({ id: expect.any(Number) }))
    })

    it('auto-increments', async () => {
      const output = [
        await insertNoteField(generateNoteFieldMock()),
        await insertNoteField(generateNoteFieldMock()),
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
        insertNoteField({ ...generateNoteFieldMock(), note: 0 }),
      ).rejects.toEqual(
        expect.objectContaining({
          cause: expect.objectContaining({
            message: expect.stringContaining('FOREIGN KEY constraint failed'),
          }),
        }),
      )
    })

    it('cannot be `null`', async () => {
      const notNullConstraintFailed = expect.objectContaining({
        cause: expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: note_field.note',
          ),
        }),
      })

      await expect(
        insertNoteField({ ...generateNoteFieldMock(), note: undefined }),
      ).rejects.toEqual(notNullConstraintFailed)
      await expect(
        insertNoteField({ ...generateNoteFieldMock(), note: null }),
      ).rejects.toEqual(notNullConstraintFailed)
    })
  })

  describe('`value` column', () => {
    it('is the type that was inserted', async () => {
      await expect(
        insertNoteField({ ...generateNoteFieldMock(), value: 0.1 }),
      ).resolves.toEqual(
        expect.objectContaining({
          value: 0.1,
        }),
      )
      await expect(
        insertNoteField({ ...generateNoteFieldMock(), value: 1 }),
      ).resolves.toEqual(
        expect.objectContaining({
          value: 1,
        }),
      )
      await expect(
        insertNoteField({ ...generateNoteFieldMock(), value: 'string' }),
      ).resolves.toEqual(
        expect.objectContaining({
          value: 'string',
        }),
      )
      await expect(
        insertNoteField({
          ...generateNoteFieldMock(),
          value: new Uint8Array(1),
        }),
      ).resolves.toEqual(
        expect.objectContaining({
          value: new Uint8Array(1),
        }),
      )
    })

    it('cannot be `null`', async () => {
      const notNullConstraintFailed = expect.objectContaining({
        cause: expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: note_field.value',
          ),
        }),
      })

      await expect(
        insertNoteField({
          note: generateNoteFieldMock().note,
          hash: '',
          value: undefined,
          position: 0,
          side: 0,
        }),
      ).rejects.toEqual(notNullConstraintFailed)
      await expect(
        insertNoteField({ ...generateNoteFieldMock(), value: null }),
      ).rejects.toEqual(notNullConstraintFailed)
    })

    it('cannot be an empty string', async () => {
      await expect(
        insertNoteField({ ...generateNoteFieldMock(), value: '' }),
      ).rejects.toEqual(
        expect.objectContaining({
          cause: expect.objectContaining({
            message: expect.stringContaining('CHECK constraint failed'),
          }),
        }),
      )
    })

    it('cannot be an empty blob', async () => {
      await expect(
        insertNoteField({
          ...generateNoteFieldMock(),
          value: new Uint8Array(),
        }),
      ).rejects.toEqual(
        expect.objectContaining({
          cause: expect.objectContaining({
            message: expect.stringContaining('CHECK constraint failed'),
          }),
        }),
      )
    })
  })

  describe('`hash` column', () => {
    it('is a string with length 44', async () => {
      const checkConstraintFailed = expect.objectContaining({
        cause: expect.objectContaining({
          message: expect.stringContaining('CHECK constraint failed'),
        }),
      })

      await expect(
        insertNoteField({
          ...generateNoteFieldMock(),
          hash: Array.from({ length: 43 }, () => 'a').join(''),
        }),
      ).rejects.toEqual(checkConstraintFailed)
      expect(
        (await insertNoteField(generateNoteFieldMock())).hash,
      ).toHaveLength(44)
      await expect(
        insertNoteField({
          ...generateNoteFieldMock(),
          hash: Array.from({ length: 45 }, () => 'a').join(''),
        }),
      ).rejects.toEqual(checkConstraintFailed)
    })

    it('cannot be `null`', async () => {
      const notNullConstraintFailed = expect.objectContaining({
        cause: expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: note_field.hash',
          ),
        }),
      })

      await expect(
        insertNoteField({
          note: generateNoteFieldMock().note,
          value: generateNoteFieldMock().value,
          hash: undefined,
          position: 0,
          side: 0,
        }),
      ).rejects.toEqual(notNullConstraintFailed)
      await expect(
        insertNoteField({ ...generateNoteFieldMock(), hash: null }),
      ).rejects.toEqual(notNullConstraintFailed)
    })
  })

  describe('`side` column', () => {
    it('is either 0 and 1', async () => {
      const checkConstraintFailed = expect.objectContaining({
        cause: expect.objectContaining({
          message: expect.stringContaining('CHECK constraint failed'),
        }),
      })

      await expect(
        insertNoteField({ ...generateNoteFieldMock(), side: -1 }),
      ).rejects.toEqual(checkConstraintFailed)
      await expect(
        insertNoteField({ ...generateNoteFieldMock(), side: 0 }),
      ).toResolve()
      await expect(
        insertNoteField({ ...generateNoteFieldMock(), side: 1 }),
      ).toResolve()
      await expect(
        insertNoteField({ ...generateNoteFieldMock(), side: 2 }),
      ).rejects.toEqual(checkConstraintFailed)
    })

    it('cannot be `null`', async () => {
      const { side, ...noteFieldMock } = generateNoteFieldMock()
      const notNullConstraintFailed = expect.objectContaining({
        cause: expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: note_field.side',
          ),
        }),
      })

      await expect(
        insertNoteField({ ...noteFieldMock, side: undefined }),
      ).rejects.toEqual(notNullConstraintFailed)
      await expect(
        insertNoteField({ ...noteFieldMock, side: null }),
      ).rejects.toEqual(notNullConstraintFailed)
    })
  })

  describe('`position` column', () => {
    it('is a value greater than or equal to 0', async () => {
      await expect(
        insertNoteField({ ...generateNoteFieldMock(), position: -1 }),
      ).rejects.toEqual(
        expect.objectContaining({
          cause: expect.objectContaining({
            message: expect.stringContaining('CHECK constraint failed'),
          }),
        }),
      )
      await expect(
        insertNoteField({ ...generateNoteFieldMock(), position: 0 }),
      ).toResolve()
      await expect(
        insertNoteField({ ...generateNoteFieldMock(), position: 1 }),
      ).toResolve()
    })

    it('cannot be `null`', async () => {
      const { position, ...noteFieldMock } = generateNoteFieldMock()
      const notNullConstraintFailed = expect.objectContaining({
        cause: expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: note_field.position',
          ),
        }),
      })

      await expect(
        insertNoteField({ ...noteFieldMock, position: undefined }),
      ).rejects.toEqual(notNullConstraintFailed)
      await expect(
        insertNoteField({ ...noteFieldMock, position: null }),
      ).rejects.toEqual(notNullConstraintFailed)
    })
  })

  describe('`is_archived` column', () => {
    it('is a boolean', async () => {
      const insertNoteFieldWithIsArchived = async (archived: any) =>
        (await insertNoteField({ ...generateNoteFieldMock(), archived }))
          .archived

      await expect(insertNoteFieldWithIsArchived(true)).resolves.toBeTrue()
      await expect(insertNoteFieldWithIsArchived(1)).resolves.toBeTrue()
      await expect(insertNoteFieldWithIsArchived(0.1)).resolves.toBeTrue()
      await expect(insertNoteFieldWithIsArchived('string')).resolves.toBeTrue()
      await expect(insertNoteFieldWithIsArchived([])).resolves.toBeTrue()
      await expect(insertNoteFieldWithIsArchived({})).resolves.toBeTrue()
      await expect(insertNoteFieldWithIsArchived(0)).resolves.toBeFalse()
      await expect(insertNoteFieldWithIsArchived(false)).resolves.toBeFalse()
    })

    it('cannot be `null`', async () => {
      await expect(
        insertNoteField({
          ...generateNoteFieldMock(),
          archived: null,
        }),
      ).rejects.toEqual(
        expect.objectContaining({
          cause: expect.objectContaining({
            message: expect.stringContaining(
              'NOT NULL constraint failed: note_field.is_archived',
            ),
          }),
        }),
      )
    })

    it('defaults to `false`', async () => {
      expect(
        (
          await insertNoteField({
            ...generateNoteFieldMock(),
            archived: undefined,
          })
        ).archived,
      ).toBeFalse()
    })
  })

  describe('`created_at` column', () => {
    it('is a date', async () => {
      const now = new Date()

      await expect(() =>
        insertNoteField({ ...generateNoteFieldMock(), createdAt: 'string' }),
      ).rejects.toThrow()
      await expect(() =>
        insertNoteField({ ...generateNoteFieldMock(), createdAt: 0.1 }),
      ).rejects.toThrow()
      await expect(() =>
        insertNoteField({ ...generateNoteFieldMock(), createdAt: 1 }),
      ).rejects.toThrow()
      await expect(
        insertNoteField({ ...generateNoteFieldMock(), createdAt: now }),
      ).resolves.toEqual(
        expect.objectContaining({
          createdAt: now,
        }),
      )
    })

    it('defaults to _now_', async () => {
      const { createdAt } = await insertNoteField(generateNoteFieldMock())

      // The `created_at` datetime is determined in the database and not something that can be mocked.
      // Expect it to be within 1000 ms of when the assertion is executed.
      expect(createdAt).toBeBetween(
        new Date(new Date().valueOf() - 1000),
        new Date(),
      )
    })

    it('cannot be `null`', async () => {
      await expect(
        insertNoteField({ ...generateNoteFieldMock(), createdAt: null }),
      ).rejects.toEqual(
        expect.objectContaining({
          cause: expect.objectContaining({
            message: expect.stringContaining(
              'NOT NULL constraint failed: note_field.created_at',
            ),
          }),
        }),
      )
    })
  })
})
