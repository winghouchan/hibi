import { and, eq } from 'drizzle-orm'
import { database } from '@/data/database'
import { collection } from '../../schema/collection'

type Collection = typeof collection.$inferSelect

function isValidColumn(column: string): column is keyof Collection {
  return column in collection
}

interface Params {
  filter: Partial<{
    [Key in keyof Collection]: Collection[Key]
  }>
}

export default async function getCollection({ filter }: Params) {
  const result = await database.query.collection.findFirst({
    where: and(
      ...Object.entries(filter).reduce<ReturnType<typeof eq>[]>(
        (conditions, [column, value]) =>
          isValidColumn(column)
            ? [...conditions, eq(collection[column], value)]
            : conditions,
        [],
      ),
    ),
  })

  return result ?? null
}
