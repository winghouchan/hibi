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
          side: index === 0 ? 0 : 1,
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
      config: { reversible: false, separable: false },
      generateExpectation: (note: Awaited<ReturnType<typeof setupNote>>) => [
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[0].id,
              side: 0,
            }),
            expect.objectContaining({
              field: note.fields[1].id,
              side: 1,
            }),
          ],
        }),
      ],
    },
    {
      fields: generateFieldMocks(2),
      config: { reversible: true, separable: false },
      generateExpectation: (note: Awaited<ReturnType<typeof setupNote>>) => [
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[0].id,
              side: 0,
            }),
            expect.objectContaining({
              field: note.fields[1].id,
              side: 1,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[1].id,
              side: 0,
            }),
            expect.objectContaining({
              field: note.fields[0].id,
              side: 1,
            }),
          ],
        }),
      ],
    },
    {
      fields: generateFieldMocks(2),
      config: { reversible: false, separable: true },
      generateExpectation: (note: Awaited<ReturnType<typeof setupNote>>) => [
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[0].id,
              side: 0,
            }),
            expect.objectContaining({
              field: note.fields[1].id,
              side: 1,
            }),
          ],
        }),
      ],
    },
    {
      fields: generateFieldMocks(2),
      config: { reversible: true, separable: true },
      generateExpectation: (note: Awaited<ReturnType<typeof setupNote>>) => [
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[0].id,
              side: 0,
            }),
            expect.objectContaining({
              field: note.fields[1].id,
              side: 1,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[1].id,
              side: 0,
            }),
            expect.objectContaining({
              field: note.fields[0].id,
              side: 1,
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
      config: { reversible: false, separable: false },
      generateExpectation: (note: Awaited<ReturnType<typeof setupNote>>) => [
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[0].id,
              side: 0,
            }),
            expect.objectContaining({
              field: note.fields[1].id,
              side: 1,
            }),
            expect.objectContaining({
              field: note.fields[2].id,
              side: 1,
            }),
          ],
        }),
      ],
    },
    {
      fields: generateFieldMocks(3),
      config: { reversible: true, separable: false },
      generateExpectation: (note: Awaited<ReturnType<typeof setupNote>>) => [
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[0].id,
              side: 0,
            }),
            expect.objectContaining({
              field: note.fields[1].id,
              side: 1,
            }),
            expect.objectContaining({
              field: note.fields[2].id,
              side: 1,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[1].id,
              side: 0,
            }),
            expect.objectContaining({
              field: note.fields[2].id,
              side: 0,
            }),
            expect.objectContaining({
              field: note.fields[0].id,
              side: 1,
            }),
          ],
        }),
      ],
    },
    {
      fields: generateFieldMocks(3),
      config: { reversible: false, separable: true },
      generateExpectation: (note: Awaited<ReturnType<typeof setupNote>>) => [
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[0].id,
              side: 0,
            }),
            expect.objectContaining({
              field: note.fields[1].id,
              side: 1,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[0].id,
              side: 0,
            }),
            expect.objectContaining({
              field: note.fields[2].id,
              side: 1,
            }),
          ],
        }),
      ],
    },
    {
      fields: generateFieldMocks(3),
      config: { reversible: true, separable: true },
      generateExpectation: (note: Awaited<ReturnType<typeof setupNote>>) => [
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[0].id,
              side: 0,
            }),
            expect.objectContaining({
              field: note.fields[1].id,
              side: 1,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[1].id,
              side: 0,
            }),
            expect.objectContaining({
              field: note.fields[0].id,
              side: 1,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[1].id,
              side: 0,
            }),
            expect.objectContaining({
              field: note.fields[2].id,
              side: 1,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[0].id,
              side: 0,
            }),
            expect.objectContaining({
              field: note.fields[2].id,
              side: 1,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[2].id,
              side: 0,
            }),
            expect.objectContaining({
              field: note.fields[0].id,
              side: 1,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[2].id,
              side: 0,
            }),
            expect.objectContaining({
              field: note.fields[1].id,
              side: 1,
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
      config: { reversible: false, separable: false },
      generateExpectation: (note: Awaited<ReturnType<typeof setupNote>>) => [
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[0].id,
              side: 0,
            }),
            expect.objectContaining({
              field: note.fields[1].id,
              side: 1,
            }),
            expect.objectContaining({
              field: note.fields[2].id,
              side: 1,
            }),
            expect.objectContaining({
              field: note.fields[3].id,
              side: 1,
            }),
          ],
        }),
      ],
    },
    {
      fields: generateFieldMocks(4),
      config: { reversible: true, separable: false },
      generateExpectation: (note: Awaited<ReturnType<typeof setupNote>>) => [
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[0].id,
              side: 0,
            }),
            expect.objectContaining({
              field: note.fields[1].id,
              side: 1,
            }),
            expect.objectContaining({
              field: note.fields[2].id,
              side: 1,
            }),
            expect.objectContaining({
              field: note.fields[3].id,
              side: 1,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[1].id,
              side: 0,
            }),
            expect.objectContaining({
              field: note.fields[2].id,
              side: 0,
            }),
            expect.objectContaining({
              field: note.fields[3].id,
              side: 0,
            }),
            expect.objectContaining({
              field: note.fields[0].id,
              side: 1,
            }),
          ],
        }),
      ],
    },
    {
      fields: generateFieldMocks(4),
      config: { reversible: false, separable: true },
      generateExpectation: (note: Awaited<ReturnType<typeof setupNote>>) => [
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[0].id,
              side: 0,
            }),
            expect.objectContaining({
              field: note.fields[1].id,
              side: 1,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[0].id,
              side: 0,
            }),
            expect.objectContaining({
              field: note.fields[2].id,
              side: 1,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[0].id,
              side: 0,
            }),
            expect.objectContaining({
              field: note.fields[3].id,
              side: 1,
            }),
          ],
        }),
      ],
    },
    {
      fields: generateFieldMocks(4),
      config: { reversible: true, separable: true },
      generateExpectation: (note: Awaited<ReturnType<typeof setupNote>>) => [
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[0].id,
              side: 0,
            }),
            expect.objectContaining({
              field: note.fields[1].id,
              side: 1,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[1].id,
              side: 0,
            }),
            expect.objectContaining({
              field: note.fields[0].id,
              side: 1,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[1].id,
              side: 0,
            }),
            expect.objectContaining({
              field: note.fields[2].id,
              side: 1,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[1].id,
              side: 0,
            }),
            expect.objectContaining({
              field: note.fields[3].id,
              side: 1,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[0].id,
              side: 0,
            }),
            expect.objectContaining({
              field: note.fields[2].id,
              side: 1,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[2].id,
              side: 0,
            }),
            expect.objectContaining({
              field: note.fields[0].id,
              side: 1,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[2].id,
              side: 0,
            }),
            expect.objectContaining({
              field: note.fields[1].id,
              side: 1,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[2].id,
              side: 0,
            }),
            expect.objectContaining({
              field: note.fields[3].id,
              side: 1,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[0].id,
              side: 0,
            }),
            expect.objectContaining({
              field: note.fields[3].id,
              side: 1,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[3].id,
              side: 0,
            }),
            expect.objectContaining({
              field: note.fields[0].id,
              side: 1,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[3].id,
              side: 0,
            }),
            expect.objectContaining({
              field: note.fields[1].id,
              side: 1,
            }),
          ],
        }),
        expect.objectContaining({
          note: note.id,
          fields: [
            expect.objectContaining({
              field: note.fields[3].id,
              side: 0,
            }),
            expect.objectContaining({
              field: note.fields[2].id,
              side: 1,
            }),
          ],
        }),
      ],
    },
  ])(
    'given $fields.length fields with 1 field on the front, reversible: $config.reversible, separable: $config.separable, creates the correct reviewable',
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
