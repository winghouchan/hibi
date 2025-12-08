import { eq } from 'drizzle-orm'
import { database, tracer } from '@/data/database'
import { CollectionParameters, collection } from '../../schema/collection'

export interface Collection<Name extends string = string> extends Omit<
  CollectionParameters,
  'createdAt'
> {
  id: Exclude<CollectionParameters['id'], undefined>
  name: Name extends '' ? never : Name
}

async function updateCollection<Name extends string>({
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

export default tracer.withSpan({ name: 'updateCollection' }, updateCollection)
