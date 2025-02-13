import { eq } from 'drizzle-orm'
import { database } from '@/data/database'
import { note } from '../../schema'

export default async function getNote(id: number) {
  const result = await database.query.note.findFirst({
    where: eq(note.id, id),
    with: {
      collections: {
        columns: {
          collection: true,
        },
      },
      fields: true,
    },
  })

  return result
    ? {
        ...result,
        collections: result.collections.map(({ collection }) => collection),
        fields: result.fields.reduce<(typeof result.fields)[]>(
          (state, field) => {
            const newState = [...state]

            if (newState[field.side]) {
              newState[field.side].push(field)
            } else {
              newState[field.side] = [field]
            }

            return newState
          },
          [],
        ),
      }
    : null
}
