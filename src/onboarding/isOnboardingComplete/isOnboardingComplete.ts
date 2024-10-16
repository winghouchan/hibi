import { collection, collectionToNote } from '@/collections/schema'
import { database } from '@/data'
import { count, eq } from 'drizzle-orm'

export default async function isOnboardingComplete() {
  const [{ complete }] = await database
    .select({
      complete: count(),
    })
    .from(collection)
    .innerJoin(collectionToNote, eq(collection.id, collectionToNote.collection))
    .limit(1)

  return Boolean(complete)
}
