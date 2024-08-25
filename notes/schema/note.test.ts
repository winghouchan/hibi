import { mockDatabase } from '@/test/utils'
import hash from 'sha.js'
import { note, noteField } from './note'

type DatabaseMock = Awaited<ReturnType<typeof mockDatabase>>
type Any<Type> = {
  [Property in keyof Type]: any
}

describe('`note` table', () => {
  let database: DatabaseMock['database'],
    resetDatabaseMock: DatabaseMock['resetDatabaseMock'],
    insertNote: (
      values?: Any<typeof note.$inferInsert>,
    ) => Promise<typeof note.$inferSelect>

  beforeEach(async () => {
    ;({ database, resetDatabaseMock } = await mockDatabase())

    insertNote = async (values = {}) =>
      (await database.insert(note).values(values).returning())[0]
  })

  afterEach(() => {
    resetDatabaseMock()
  })

  describe('`id` column', () => {
    it('is an integer', async () => {
      const datatypeMismatch = expect.objectContaining({
        message: expect.stringContaining('datatype mismatch'),
      })

      await expect(insertNote({ id: 'string' })).rejects.toEqual(
        datatypeMismatch,
      )
      await expect(insertNote({ id: 0.1 })).rejects.toEqual(datatypeMismatch)
      await expect(insertNote({ id: 1 })).resolves.toEqual(
        expect.objectContaining({ id: expect.any(Number) }),
      )
    })

    it('cannot be `null`', async () => {
      await expect(insertNote({ id: undefined })).resolves.toEqual(
        expect.objectContaining({ id: expect.any(Number) }),
      )
      await expect(insertNote({ id: null })).resolves.toEqual(
        expect.objectContaining({ id: expect.any(Number) }),
      )
    })

    it('auto-increments', async () => {
      const output = [await insertNote(), await insertNote()]

      expect(output).toEqual([
        expect.objectContaining({ id: 1 }),
        expect.objectContaining({ id: 2 }),
      ])
    })
  })

  describe('`created_at` column', () => {
    it('is a date', async () => {
      const now = new Date()

      await expect(() => insertNote({ created_at: 'string' })).rejects.toThrow()
      await expect(() => insertNote({ created_at: 0.1 })).rejects.toThrow()
      await expect(() => insertNote({ created_at: 1 })).rejects.toThrow()
      await expect(insertNote({ created_at: now })).resolves.toEqual(
        expect.objectContaining({
          created_at: now,
        }),
      )
    })

    it('defaults to _now_', async () => {
      const { created_at } = await insertNote()

      // The `created_at` datetime is determined in the database and not something that can be mocked.
      // Expect it to be within 1000 ms of when the assertion is executed.
      expect(created_at).toBeBetween(
        new Date(new Date().valueOf() - 1000),
        new Date(),
      )
    })

    it('cannot be `null`', async () => {
      await expect(insertNote({ created_at: null })).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: note.created_at',
          ),
        }),
      )
    })
  })
})

describe('`note_field` table', () => {
  let database: DatabaseMock['database'],
    resetDatabaseMock: DatabaseMock['resetDatabaseMock'],
    insertNoteField: (
      values: Any<typeof noteField.$inferInsert>,
    ) => Promise<typeof noteField.$inferSelect>,
    generateNoteFieldMock: () => Pick<
      typeof noteField.$inferSelect,
      'hash' | 'note' | 'value'
    >

  beforeEach(async () => {
    ;({ database, resetDatabaseMock } = await mockDatabase())

    const [{ noteId }] = await database
      .insert(note)
      .values({})
      .returning({ noteId: note.id })

    generateNoteFieldMock = () => ({
      note: noteId,
      value: 'Note Field Value',
      hash: hash('sha256').update('Note Field Value').digest('base64'),
    })

    insertNoteField = async (values) =>
      (await database.insert(noteField).values(values).returning())[0]
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
          message: expect.stringContaining('FOREIGN KEY constraint failed'),
        }),
      )
    })

    it('cannot be `null`', async () => {
      const notNullConstraintFailed = expect.objectContaining({
        message: expect.stringContaining(
          'NOT NULL constraint failed: note_field.note',
        ),
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
        message: expect.stringContaining(
          'NOT NULL constraint failed: note_field.value',
        ),
      })

      await expect(
        insertNoteField({
          note: generateNoteFieldMock().note,
          hash: '',
          value: undefined,
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
          message: expect.stringContaining(
            'CHECK constraint failed: length(`value`) > 0',
          ),
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
          message: expect.stringContaining(
            'CHECK constraint failed: length(`value`) > 0',
          ),
        }),
      )
    })
  })

  describe('`hash` column', () => {
    it('is a string with length 44', async () => {
      const checkConstraintFailed = expect.objectContaining({
        message: expect.stringContaining(
          'CHECK constraint failed: length(`hash`) = 44',
        ),
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
        message: expect.stringContaining(
          'NOT NULL constraint failed: note_field.hash',
        ),
      })

      await expect(
        insertNoteField({
          note: generateNoteFieldMock().note,
          value: generateNoteFieldMock().value,
          hash: undefined,
        }),
      ).rejects.toEqual(notNullConstraintFailed)
      await expect(
        insertNoteField({ ...generateNoteFieldMock(), hash: null }),
      ).rejects.toEqual(notNullConstraintFailed)
    })
  })

  describe('`is_archived` column', () => {
    it('is a boolean', async () => {
      const insertNoteFieldWithIsArchived = async (is_archived: any) =>
        (await insertNoteField({ ...generateNoteFieldMock(), is_archived }))
          .is_archived

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
          is_archived: null,
        }),
      ).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: note_field.is_archived',
          ),
        }),
      )
    })

    it('defaults to `false`', async () => {
      expect(
        (
          await insertNoteField({
            ...generateNoteFieldMock(),
            is_archived: undefined,
          })
        ).is_archived,
      ).toBeFalse()
    })
  })

  describe('`created_at` column', () => {
    it('is a date', async () => {
      const now = new Date()

      await expect(() =>
        insertNoteField({ ...generateNoteFieldMock(), created_at: 'string' }),
      ).rejects.toThrow()
      await expect(() =>
        insertNoteField({ ...generateNoteFieldMock(), created_at: 0.1 }),
      ).rejects.toThrow()
      await expect(() =>
        insertNoteField({ ...generateNoteFieldMock(), created_at: 1 }),
      ).rejects.toThrow()
      await expect(
        insertNoteField({ ...generateNoteFieldMock(), created_at: now }),
      ).resolves.toEqual(
        expect.objectContaining({
          created_at: now,
        }),
      )
    })

    it('defaults to _now_', async () => {
      const { created_at } = await insertNoteField(generateNoteFieldMock())

      // The `created_at` datetime is determined in the database and not something that can be mocked.
      // Expect it to be within 1000 ms of when the assertion is executed.
      expect(created_at).toBeBetween(
        new Date(new Date().valueOf() - 1000),
        new Date(),
      )
    })

    it('cannot be `null`', async () => {
      await expect(
        insertNoteField({ ...generateNoteFieldMock(), created_at: null }),
      ).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: note_field.created_at',
          ),
        }),
      )
    })
  })
})
