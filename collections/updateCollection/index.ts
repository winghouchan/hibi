import { eq } from 'drizzle-orm'
import { collection } from '../schema/collection'

export interface Collection<Name extends string = string>
  extends Omit<typeof collection.$inferInsert, 'created_at'> {
  id: number
  name: Name extends '' ? never : Name
}

export default async function updateCollection<Name extends string>({
  id,
  name,
}: Collection<Name>) {
  const { database } = await import('@/database')

  return (
    await database
      .update(collection)
      .set({ name })
      .where(eq(collection.id, id))
      .returning()
  )[0]
}
