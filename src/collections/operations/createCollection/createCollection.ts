import { database, tracer } from '@/data/database'
import { collection, CollectionParameters } from '../../schema/collection'

export interface Collection<Name extends string = string>
  extends Omit<CollectionParameters, 'id' | 'createdAt'> {
  name: Name extends '' ? never : Name
}

async function createCollection<Name extends string>({
  name,
}: Collection<Name>) {
  const [result] = await database
    .insert(collection)
    .values({ name })
    .returning()

  return result
}

export default tracer.withSpan({ name: 'createCollection' }, createCollection)
