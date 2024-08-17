import { collection } from '../schema/collection'

export interface Collection<Name extends string = string>
  extends Omit<typeof collection.$inferInsert, 'id' | 'created_at'> {
  name: Name extends '' ? never : Name
}

export default async function createCollection<Name extends string>({
  name,
}: Collection<Name>) {
  const { database } = await import('@/database')

  const [result] = await database
    .insert(collection)
    .values({ name })
    .returning()

  return result
}
