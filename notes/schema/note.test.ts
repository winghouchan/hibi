import { mockDatabase } from '@/test/utils'
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
    noteFieldMock: Pick<typeof noteField.$inferSelect, 'note' | 'value'>

  beforeEach(async () => {
    ;({ database, resetDatabaseMock } = await mockDatabase())

    const [{ noteId }] = await database
      .insert(note)
      .values({})
      .returning({ noteId: note.id })

    noteFieldMock = {
      note: noteId,
      value: 'Note Field Value',
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
        message: expect.stringContaining('datatype mismatch'),
      })

      await expect(
        insertNoteField({ ...noteFieldMock, id: 'string' }),
      ).rejects.toEqual(datatypeMismatch)
      await expect(
        insertNoteField({ ...noteFieldMock, id: 0.1 }),
      ).rejects.toEqual(datatypeMismatch)
      await expect(
        insertNoteField({ ...noteFieldMock, id: 1 }),
      ).resolves.toEqual(expect.objectContaining({ id: expect.any(Number) }))
    })

    it('cannot be `null`', async () => {
      await expect(
        insertNoteField({ ...noteFieldMock, id: undefined }),
      ).resolves.toEqual(expect.objectContaining({ id: expect.any(Number) }))
      await expect(
        insertNoteField({ ...noteFieldMock, id: null }),
      ).resolves.toEqual(expect.objectContaining({ id: expect.any(Number) }))
    })

    it('auto-increments', async () => {
      const output = [
        await insertNoteField(noteFieldMock),
        await insertNoteField(noteFieldMock),
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
        insertNoteField({ ...noteFieldMock, note: 0 }),
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
        insertNoteField({ ...noteFieldMock, note: undefined }),
      ).rejects.toEqual(notNullConstraintFailed)
      await expect(
        insertNoteField({ ...noteFieldMock, note: null }),
      ).rejects.toEqual(notNullConstraintFailed)
    })
  })

  describe('`value` column', () => {
    it('is the type that was inserted', async () => {
      await expect(
        insertNoteField({ ...noteFieldMock, value: 0.1 }),
      ).resolves.toEqual(
        expect.objectContaining({
          value: 0.1,
        }),
      )
      await expect(
        insertNoteField({ ...noteFieldMock, value: 1 }),
      ).resolves.toEqual(
        expect.objectContaining({
          value: 1,
        }),
      )
      await expect(
        insertNoteField({ ...noteFieldMock, value: 'string' }),
      ).resolves.toEqual(
        expect.objectContaining({
          value: 'string',
        }),
      )
      await expect(
        insertNoteField({ ...noteFieldMock, value: new Uint8Array(1) }),
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
        insertNoteField({ note: noteFieldMock.note, value: undefined }),
      ).rejects.toEqual(notNullConstraintFailed)
      await expect(
        insertNoteField({ ...noteFieldMock, value: null }),
      ).rejects.toEqual(notNullConstraintFailed)
    })

    it('cannot be an empty string', async () => {
      await expect(
        insertNoteField({ ...noteFieldMock, value: '' }),
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
        insertNoteField({ ...noteFieldMock, value: new Uint8Array() }),
      ).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'CHECK constraint failed: length(`value`) > 0',
          ),
        }),
      )
    })
  })

  describe('`created_at` column', () => {
    it('is a date', async () => {
      const now = new Date()

      await expect(() =>
        insertNoteField({ ...noteFieldMock, created_at: 'string' }),
      ).rejects.toThrow()
      await expect(() =>
        insertNoteField({ ...noteFieldMock, created_at: 0.1 }),
      ).rejects.toThrow()
      await expect(() =>
        insertNoteField({ ...noteFieldMock, created_at: 1 }),
      ).rejects.toThrow()
      await expect(
        insertNoteField({ ...noteFieldMock, created_at: now }),
      ).resolves.toEqual(
        expect.objectContaining({
          created_at: now,
        }),
      )
    })

    it('defaults to _now_', async () => {
      const { created_at } = await insertNoteField(noteFieldMock)

      // The `created_at` datetime is determined in the database and not something that can be mocked.
      // Expect it to be within 1000 ms of when the assertion is executed.
      expect(created_at).toBeBetween(
        new Date(new Date().valueOf() - 1000),
        new Date(),
      )
    })

    it('cannot be `null`', async () => {
      await expect(
        insertNoteField({ ...noteFieldMock, created_at: null }),
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
