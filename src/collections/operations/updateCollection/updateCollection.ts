import { eq } from 'drizzle-orm'
import { database } from '@/data/database'
import { collection } from '../../schema/collection'

export interface Collection<Name extends string = string>
  extends Omit<typeof collection.$inferInsert, 'createdAt'> {
  id: number
  name: Name extends '' ? never : Name
}

export default async function updateCollection<Name extends string>({
  id,
  name,
}: Collection<Name>) {
  return (
    await database
      .update(collection)
      .set({ name })
      .where(eq(collection.id, id))
      .returning()
  )[0]
}
