import { collection, collectionToNote } from '@/collections/schema'
import { mockDatabase } from 'test/utils'
import hashNoteFieldValue from '../../hashNoteFieldValue'
import { note, noteField } from '../../schema'

describe('getNote', () => {
  test.each([
    {
      name: 'when ID is provided and note does not exist, returns `null`',
      fixture: {},
      input: 0,
      expected: null,
    },
    {
      name: 'when ID is provided and note exists, returns the note',
      fixture: {
        collection: {
          id: 1,
          name: 'Collection Mock',
        },
        note: {
          id: 1,
          collection: 1,
          reversible: false,
          separable: false,
          fields: [
            {
              type: 'text/plain',
              value: 'Front',
              hash: hashNoteFieldValue('Front'),
              side: 0,
              position: 0,
            },
            {
              type: 'text/plain',
              value: 'Back',
              hash: hashNoteFieldValue('Back'),
              side: 1,
              position: 0,
            },
          ],
        },
      },
      input: 1,
      expected: expect.objectContaining({
        id: 1,
        reversible: false,
        separable: false,
        createdAt: expect.any(Date),
        collections: [1],
        fields: [
          [expect.objectContaining({ type: 'text/plain', value: 'Front' })],
          [expect.objectContaining({ type: 'text/plain', value: 'Back' })],
        ],
      }),
    },
  ])('$name', async ({ expected, fixture, input }) => {
    const { database, resetDatabaseMock } = await mockDatabase()
    const { default: getNote } = await import('./getNote')

    if (fixture.collection) {
      await database.insert(collection).values(fixture.collection)
    }

    if (fixture.note) {
      const { collection, fields, ...data } = fixture.note

      await database.insert(note).values(data)
      await database.insert(collectionToNote).values({
        note: data.id,
        collection,
      })
      await Promise.all(
        fields.map(async (field) => {
          await database.insert(noteField).values({
            note: data.id,
            ...field,
          })
        }),
      )
    }

    const output = await getNote(input)

    expect(output).toEqual(expected)

    resetDatabaseMock()
  })
})
