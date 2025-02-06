import { eq } from 'drizzle-orm'
import { database } from '@/data/database'
import { collection } from '../../schema/collection'

export default async function getCollection(id: number) {
  const result = await database.query.collection.findFirst({
    where: eq(collection.id, id),
    with: { notes: { with: { note: { with: { fields: true } } } } },
  })

  return result
    ? {
        ...result,
        notes: result.notes.map<
          Omit<(typeof result.notes)[number]['note'], keyof number>
        >(({ note }) => note),
      }
    : null
}
