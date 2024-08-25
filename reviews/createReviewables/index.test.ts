import { schema } from '@/notes'
import { mockDatabase } from '@/test/utils'
import hash from 'sha.js'

function generateFieldMocks(length: number) {
  return Array.from({ length }, () => ({
    value: 'Field Mock',
    hash: hash('sha256').update('Field Mock').digest('base64'),
  }))
}

async function setupNote({
  fields,
}: {
  fields: ReturnType<typeof generateFieldMocks>
}) {
  const { database } = await import('@/database')

  return await database.transaction(async (transaction) => {
    const [insertedNote] = await transaction
      .insert(schema.note)
      .values({})
      .returning()

    const insertedFields = await transaction
      .insert(schema.noteField)
      .values(
        fields.map((field, index) => ({
          ...field,
          note: insertedNote.id,
          position: index,
        })),
      )
      .returning()

    return {
      ...insertedNote,
      fields: insertedFields,
    }
  })
}
describe('createReviewables', () => {
  test.each([
    /**
     * 2 fields
     */
    {
      fields: generateFieldMocks(2),
      config: { reversible: false, reviewFieldsSeparately: false },
      generateExpectation: (note: Awaited<ReturnType<typeof setupNote>>) => [
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[0].id,
            }),
            expect.objectContaining({
              field: note.fields[1].id,
            }),
          ],
        }),
      ],
    },
    {
      fields: generateFieldMocks(2),
      config: { reversible: true, reviewFieldsSeparately: false },
      generateExpectation: (note: Awaited<ReturnType<typeof setupNote>>) => [
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[0].id,
            }),
            expect.objectContaining({
              field: note.fields[1].id,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[1].id,
            }),
            expect.objectContaining({
              field: note.fields[0].id,
            }),
          ],
        }),
      ],
    },
    {
      fields: generateFieldMocks(2),
      config: { reversible: false, reviewFieldsSeparately: true },
      generateExpectation: (note: Awaited<ReturnType<typeof setupNote>>) => [
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[0].id,
            }),
            expect.objectContaining({
              field: note.fields[1].id,
            }),
          ],
        }),
      ],
    },
    {
      fields: generateFieldMocks(2),
      config: { reversible: true, reviewFieldsSeparately: true },
      generateExpectation: (note: Awaited<ReturnType<typeof setupNote>>) => [
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[0].id,
            }),
            expect.objectContaining({
              field: note.fields[1].id,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[1].id,
            }),
            expect.objectContaining({
              field: note.fields[0].id,
            }),
          ],
        }),
      ],
    },
    /**
     * 3 fields
     */
    {
      fields: generateFieldMocks(3),
      config: { reversible: false, reviewFieldsSeparately: false },
      generateExpectation: (note: Awaited<ReturnType<typeof setupNote>>) => [
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[0].id,
            }),
            expect.objectContaining({
              field: note.fields[1].id,
            }),
            expect.objectContaining({
              field: note.fields[2].id,
            }),
          ],
        }),
      ],
    },
    {
      fields: generateFieldMocks(3),
      config: { reversible: true, reviewFieldsSeparately: false },
      generateExpectation: (note: Awaited<ReturnType<typeof setupNote>>) => [
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[0].id,
            }),
            expect.objectContaining({
              field: note.fields[1].id,
            }),
            expect.objectContaining({
              field: note.fields[2].id,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[1].id,
            }),
            expect.objectContaining({
              field: note.fields[2].id,
            }),
            expect.objectContaining({
              field: note.fields[0].id,
            }),
          ],
        }),
      ],
    },
    {
      fields: generateFieldMocks(3),
      config: { reversible: false, reviewFieldsSeparately: true },
      generateExpectation: (note: Awaited<ReturnType<typeof setupNote>>) => [
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[0].id,
            }),
            expect.objectContaining({
              field: note.fields[1].id,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[0].id,
            }),
            expect.objectContaining({
              field: note.fields[2].id,
            }),
          ],
        }),
      ],
    },
    {
      fields: generateFieldMocks(3),
      config: { reversible: true, reviewFieldsSeparately: true },
      generateExpectation: (note: Awaited<ReturnType<typeof setupNote>>) => [
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[0].id,
            }),
            expect.objectContaining({
              field: note.fields[1].id,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[0].id,
            }),
            expect.objectContaining({
              field: note.fields[2].id,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[1].id,
            }),
            expect.objectContaining({
              field: note.fields[0].id,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[1].id,
            }),
            expect.objectContaining({
              field: note.fields[2].id,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[2].id,
            }),
            expect.objectContaining({
              field: note.fields[0].id,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[2].id,
            }),
            expect.objectContaining({
              field: note.fields[1].id,
            }),
          ],
        }),
      ],
    },
    /**
     * 4 fields
     */
    {
      fields: generateFieldMocks(4),
      config: { reversible: false, reviewFieldsSeparately: false },
      generateExpectation: (note: Awaited<ReturnType<typeof setupNote>>) => [
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[0].id,
            }),
            expect.objectContaining({
              field: note.fields[1].id,
            }),
            expect.objectContaining({
              field: note.fields[2].id,
            }),
            expect.objectContaining({
              field: note.fields[3].id,
            }),
          ],
        }),
      ],
    },
    {
      fields: generateFieldMocks(4),
      config: { reversible: true, reviewFieldsSeparately: false },
      generateExpectation: (note: Awaited<ReturnType<typeof setupNote>>) => [
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[0].id,
            }),
            expect.objectContaining({
              field: note.fields[1].id,
            }),
            expect.objectContaining({
              field: note.fields[2].id,
            }),
            expect.objectContaining({
              field: note.fields[3].id,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[1].id,
            }),
            expect.objectContaining({
              field: note.fields[2].id,
            }),
            expect.objectContaining({
              field: note.fields[3].id,
            }),
            expect.objectContaining({
              field: note.fields[0].id,
            }),
          ],
        }),
      ],
    },
    {
      fields: generateFieldMocks(4),
      config: { reversible: false, reviewFieldsSeparately: true },
      generateExpectation: (note: Awaited<ReturnType<typeof setupNote>>) => [
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[0].id,
            }),
            expect.objectContaining({
              field: note.fields[1].id,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[0].id,
            }),
            expect.objectContaining({
              field: note.fields[2].id,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[0].id,
            }),
            expect.objectContaining({
              field: note.fields[3].id,
            }),
          ],
        }),
      ],
    },
    {
      fields: generateFieldMocks(4),
      config: { reversible: true, reviewFieldsSeparately: true },
      generateExpectation: (note: Awaited<ReturnType<typeof setupNote>>) => [
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[0].id,
            }),
            expect.objectContaining({
              field: note.fields[1].id,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[0].id,
            }),
            expect.objectContaining({
              field: note.fields[2].id,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[0].id,
            }),
            expect.objectContaining({
              field: note.fields[3].id,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[1].id,
            }),
            expect.objectContaining({
              field: note.fields[0].id,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[1].id,
            }),
            expect.objectContaining({
              field: note.fields[2].id,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[1].id,
            }),
            expect.objectContaining({
              field: note.fields[3].id,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[2].id,
            }),
            expect.objectContaining({
              field: note.fields[0].id,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[2].id,
            }),
            expect.objectContaining({
              field: note.fields[1].id,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[2].id,
            }),
            expect.objectContaining({
              field: note.fields[3].id,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[3].id,
            }),
            expect.objectContaining({
              field: note.fields[0].id,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[3].id,
            }),
            expect.objectContaining({
              field: note.fields[1].id,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[3].id,
            }),
            expect.objectContaining({
              field: note.fields[2].id,
            }),
          ],
        }),
      ],
    },
  ])(
    '$fields.length fields, reversible: $config.reversible, reviewFieldsSeparately: $config.reviewFieldsSeparately',
    async ({ fields, config, generateExpectation }) => {
      const { resetDatabaseMock } = await mockDatabase()
      const { default: createReviewables } = await import('.')
      const note = await setupNote({ fields })
      const input = { config, note }

      const output = createReviewables(input)

      expect(output).toEqual(generateExpectation(note))

      resetDatabaseMock()
    },
  )
})
