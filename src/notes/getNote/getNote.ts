import { database } from '@/data'
import { eq } from 'drizzle-orm'
import { note } from '../schema'

export default async function getNote(id: number) {
  const result = await database.query.note.findFirst({
    where: eq(note.id, id),
    with: {
      fields: true,
    },
  })

  return result
    ? {
        ...result,
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
