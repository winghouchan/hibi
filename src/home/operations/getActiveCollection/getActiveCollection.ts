import { eq, getTableColumns } from 'drizzle-orm'
import { collection } from '@/collections/schema'
import { database, tracer } from '@/data/database'
import { user } from '@/user/schema'

async function getActiveCollection() {
  const [activeCollection] = await database
    .select(getTableColumns(collection))
    .from(user)
    .rightJoin(collection, eq(user.activeCollection, collection.id))
    .limit(1)

  return activeCollection
}

export default tracer.withSpan(
  { name: 'getActiveCollection' },
  getActiveCollection,
)
