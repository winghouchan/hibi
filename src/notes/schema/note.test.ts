import { mockDatabase } from 'test/utils'
import { Note, NoteParameters, note } from './note'

type DatabaseMock = Awaited<ReturnType<typeof mockDatabase>>
type Any<Type> = {
  [Property in keyof Type]: any
}

describe('`note` table', () => {
  let database: DatabaseMock['database'],
    resetDatabaseMock: DatabaseMock['resetDatabaseMock'],
    insertNote: (values?: Any<NoteParameters>) => Promise<Note>

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

  describe('`is_reversible` column', () => {
    it('is a boolean', async () => {
      const insertNoteWithIsReversible = async (reversible: any) =>
        (await insertNote({ reversible })).reversible

      await expect(insertNoteWithIsReversible(true)).resolves.toBeTrue()
      await expect(insertNoteWithIsReversible(1)).resolves.toBeTrue()
      await expect(insertNoteWithIsReversible(0.1)).resolves.toBeTrue()
      await expect(insertNoteWithIsReversible('string')).resolves.toBeTrue()
      await expect(insertNoteWithIsReversible([])).resolves.toBeTrue()
      await expect(insertNoteWithIsReversible({})).resolves.toBeTrue()
      await expect(insertNoteWithIsReversible(0)).resolves.toBeFalse()
      await expect(insertNoteWithIsReversible(false)).resolves.toBeFalse()
    })

    it('cannot be `null`', async () => {
      await expect(
        insertNote({
          reversible: null,
        }),
      ).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: note.is_reversible',
          ),
        }),
      )
    })

    it('defaults to `false`', async () => {
      expect(
        (
          await insertNote({
            reversible: undefined,
          })
        ).reversible,
      ).toBeFalse()
    })
  })

  describe('`is_separable` column', () => {
    it('is a boolean', async () => {
      const insertNoteWithIsReversible = async (separable: any) =>
        (await insertNote({ separable })).separable

      await expect(insertNoteWithIsReversible(true)).resolves.toBeTrue()
      await expect(insertNoteWithIsReversible(1)).resolves.toBeTrue()
      await expect(insertNoteWithIsReversible(0.1)).resolves.toBeTrue()
      await expect(insertNoteWithIsReversible('string')).resolves.toBeTrue()
      await expect(insertNoteWithIsReversible([])).resolves.toBeTrue()
      await expect(insertNoteWithIsReversible({})).resolves.toBeTrue()
      await expect(insertNoteWithIsReversible(0)).resolves.toBeFalse()
      await expect(insertNoteWithIsReversible(false)).resolves.toBeFalse()
    })

    it('cannot be `null`', async () => {
      await expect(
        insertNote({
          separable: null,
        }),
      ).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: note.is_separable',
          ),
        }),
      )
    })

    it('defaults to `false`', async () => {
      expect(
        (
          await insertNote({
            separable: undefined,
          })
        ).separable,
      ).toBeFalse()
    })
  })

  describe('`created_at` column', () => {
    it('is a date', async () => {
      const now = new Date()

      await expect(() => insertNote({ createdAt: 'string' })).rejects.toThrow()
      await expect(() => insertNote({ createdAt: 0.1 })).rejects.toThrow()
      await expect(() => insertNote({ createdAt: 1 })).rejects.toThrow()
      await expect(insertNote({ createdAt: now })).resolves.toEqual(
        expect.objectContaining({
          createdAt: now,
        }),
      )
    })

    it('defaults to _now_', async () => {
      const { createdAt } = await insertNote()

      // The `created_at` datetime is determined in the database and not something that can be mocked.
      // Expect it to be within 1000 ms of when the assertion is executed.
      expect(createdAt).toBeBetween(
        new Date(new Date().valueOf() - 1000),
        new Date(),
      )
    })

    it('cannot be `null`', async () => {
      await expect(insertNote({ createdAt: null })).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: note.created_at',
          ),
        }),
      )
    })
  })
})
