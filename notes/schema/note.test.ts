import { mockDatabase } from '@/test/utils'
import { note, noteField } from './note'

describe('`note` table', () => {
  describe('`id` column', () => {
    it('is an integer', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const insertNote = async ({ id }: { id: any }) =>
        (
          await database.insert(note).values({ id }).returning({ id: note.id })
        )[0]

      await expect(() => insertNote({ id: 'string' })).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining('datatype mismatch'),
        }),
      )
      await expect(() => insertNote({ id: 0.1 })).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining('datatype mismatch'),
        }),
      )
      await expect(insertNote({ id: 1 })).resolves.toEqual({ id: 1 })

      resetDatabaseMock()
    })

    it('cannot be `null`', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const insertNoteWithNullId = async () =>
        (
          await database
            .insert(note)
            .values({
              // Cast `null` to `number` so that compile time checks pass and run time checks can be tested
              id: null as unknown as number,
            })
            .returning({ id: note.id })
        )[0]

      const output = await insertNoteWithNullId()

      expect(output).toEqual({ id: 1 })

      resetDatabaseMock()
    })

    it('auto-increments', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const insertNote = async () =>
        (await database.insert(note).values({}).returning({ id: note.id }))[0]

      const output = [await insertNote(), await insertNote()]

      expect(output).toEqual([{ id: 1 }, { id: 2 }])

      resetDatabaseMock()
    })
  })

  describe('`created_at` column', () => {
    it('is a date', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const insertNote = async ({ created_at }: { created_at: any }) =>
        (
          await database
            .insert(note)
            .values({ created_at })
            .returning({ createdAt: note.created_at })
        )[0]
      const now = new Date()

      await expect(() => insertNote({ created_at: 'string' })).rejects.toThrow()
      await expect(() => insertNote({ created_at: 0.1 })).rejects.toThrow()
      await expect(() => insertNote({ created_at: 1 })).rejects.toThrow()
      await expect(insertNote({ created_at: now })).resolves.toEqual({
        createdAt: now,
      })

      resetDatabaseMock()
    })

    it('defaults to _now_', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const insertNote = async () =>
        (
          await database
            .insert(note)
            .values({})
            .returning({ createdAt: note.created_at })
        )[0]

      const { createdAt } = await insertNote()

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
      const insertNoteWithNullCreatedAt = async () =>
        await database.insert(note).values({
          // Cast `null` to `Date` so that compile time checks pass and run time checks can be tested
          created_at: null as unknown as Date,
        })

      await expect(insertNoteWithNullCreatedAt).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: note.created_at',
          ),
        }),
      )

      resetDatabaseMock()
    })
  })
})

describe('`note_field` table', () => {
  describe('`id` column', () => {
    it('is an integer', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      const insertNoteField = async ({ id }: { id: any }) =>
        (
          await database
            .insert(noteField)
            .values({ id, note: noteId, value: 'Note Field' })
            .returning({ id: note.id })
        )[0]

      await expect(() => insertNoteField({ id: 'string' })).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining('datatype mismatch'),
        }),
      )
      await expect(() => insertNoteField({ id: 0.1 })).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining('datatype mismatch'),
        }),
      )
      await expect(insertNoteField({ id: 1 })).resolves.toEqual({ id: 1 })

      resetDatabaseMock()
    })

    it('cannot be `null`', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      const insertNoteFieldWithNullId = async () =>
        (
          await database
            .insert(noteField)
            .values({
              // Cast `null` to `number` so that compile time checks pass and run time checks can be tested
              id: null as unknown as number,
              note: noteId,
              value: 'Note Field',
            })
            .returning({ id: note.id })
        )[0]

      const output = await insertNoteFieldWithNullId()

      expect(output).toEqual({ id: 1 })

      resetDatabaseMock()
    })

    it('auto-increments', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      const insertNoteField = async () =>
        (
          await database
            .insert(noteField)
            .values({
              note: noteId,
              value: 'Note Field',
            })
            .returning({ id: note.id })
        )[0]

      await database.insert(note).values({})

      const output = [await insertNoteField(), await insertNoteField()]

      expect(output).toEqual([{ id: 1 }, { id: 2 }])

      resetDatabaseMock()
    })
  })

  describe('`note` column', () => {
    it('must reference a note', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const insertNoteField = async () =>
        await database
          .insert(noteField)
          .values({ note: 0, value: 'Note Field' })

      await expect(insertNoteField).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining('FOREIGN KEY constraint failed'),
        }),
      )

      resetDatabaseMock()
    })

    it('cannot be `null`', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const insertNoteField = async () =>
        await database.insert(noteField).values({
          // Cast `null` to `number` so that compile time checks pass and run time checks can be tested
          note: null as unknown as number,
          value: 'Note Field',
        })

      await expect(insertNoteField).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: note_field.note',
          ),
        }),
      )

      resetDatabaseMock()
    })
  })

  describe('`value` column', () => {
    it('is the type that was inserted', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      const insertNoteField = async ({ value }: { value: any }) =>
        (
          await database
            .insert(noteField)
            .values({ note: noteId, value })
            .returning({ value: noteField.value })
        )[0]

      await expect(insertNoteField({ value: 0.1 })).resolves.toEqual({
        value: 0.1,
      })
      await expect(insertNoteField({ value: 1 })).resolves.toEqual({
        value: 1.0,
      })
      await expect(insertNoteField({ value: 'string' })).resolves.toEqual({
        value: 'string',
      })
      await expect(
        insertNoteField({ value: new Uint8Array(1) }),
      ).resolves.toEqual(
        expect.objectContaining({
          value: new Uint8Array(1),
        }),
      )

      resetDatabaseMock()
    })

    it('cannot be `null`', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      const insertNoteFieldWithNullName = async () =>
        await database.insert(noteField).values({
          // Cast `null` to `string` so that compile time checks pass and run time checks can be tested
          value: null as unknown as string,

          note: noteId,
        })

      await database.insert(note).values({})

      await expect(insertNoteFieldWithNullName).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: note_field.value',
          ),
        }),
      )

      resetDatabaseMock()
    })

    it('cannot be an empty string', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      const insertNoteFieldWithEmptyValue = async () =>
        await database.insert(noteField).values({ value: '', note: noteId })

      await expect(insertNoteFieldWithEmptyValue).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'CHECK constraint failed: length(`value`) > 0',
          ),
        }),
      )

      resetDatabaseMock()
    })

    it('cannot be an empty blob', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      const insertNoteFieldWithEmptyValue = async () =>
        await database
          .insert(noteField)
          .values({ value: new Uint8Array(), note: noteId })

      await expect(insertNoteFieldWithEmptyValue).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'CHECK constraint failed: length(`value`) > 0',
          ),
        }),
      )

      resetDatabaseMock()
    })
  })

  describe('`created_at` column', () => {
    it('is a date', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      const insertNoteField = async ({ created_at }: { created_at: any }) =>
        (
          await database
            .insert(noteField)
            .values({ created_at, note: noteId, value: 'Note Field' })
            .returning({ createdAt: note.created_at })
        )[0]
      const now = new Date()

      await expect(() =>
        insertNoteField({ created_at: 'string' }),
      ).rejects.toThrow()
      await expect(() => insertNoteField({ created_at: 0.1 })).rejects.toThrow()
      await expect(() => insertNoteField({ created_at: 1 })).rejects.toThrow()
      await expect(insertNoteField({ created_at: now })).resolves.toEqual({
        createdAt: now,
      })

      resetDatabaseMock()
    })

    it('defaults to _now_', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      const insertNoteField = async () =>
        (
          await database
            .insert(noteField)
            .values({ note: noteId, value: 'Note Field' })
            .returning({ createdAt: note.created_at })
        )[0]

      const { createdAt } = await insertNoteField()

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
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      const insertNoteFieldWithNullCreatedAt = async () =>
        await database.insert(noteField).values({
          // Cast `null` to `Date` so that compile time checks pass and run time checks can be tested
          created_at: null as unknown as Date,
          note: noteId,
          value: 'Note Field',
        })

      await expect(insertNoteFieldWithNullCreatedAt).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: note_field.created_at',
          ),
        }),
      )

      resetDatabaseMock()
    })
  })
})
