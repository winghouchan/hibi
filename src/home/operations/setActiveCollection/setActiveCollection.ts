import { eq } from 'drizzle-orm'
import { collection, Collection } from '@/collections/schema'
import { database, tracer } from '@/data/database'
import { user } from '@/user/schema'

async function setActiveCollection(activeCollection: Collection['id']) {
  return await database.transaction(async (transaction) => {
    await transaction
      .update(user)
      .set({ activeCollection })
      .where(eq(user.id, database.select({ id: user.id }).from(user).limit(1)))
      .returning()

    const [newActiveCollection] = await transaction
      .select()
      .from(collection)
      .where(eq(collection.id, activeCollection))

    return newActiveCollection
  })
}

export default tracer.withSpan(
  { name: 'setActiveCollection' },
  setActiveCollection,
)
