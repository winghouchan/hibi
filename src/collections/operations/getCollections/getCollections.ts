import { and, eq, inArray } from 'drizzle-orm'
import { RequireAtLeastOne } from 'type-fest'
import { collection } from '@/collections/schema'
import { database } from '@/data/database'

type Collection = typeof collection.$inferSelect

function isValidColumn(column: string): column is keyof Collection {
  return column in collection
}

interface Params {
  filter?: RequireAtLeastOne<{
    [Key in keyof Collection]: Collection[Key] | Collection[Key][]
  }>
}

export default async function getCollections({ filter }: Params = {}) {
  return await database.query.collection.findMany(
    filter && {
      where: and(
        ...Object.entries(filter).reduce<
          ReturnType<typeof inArray | typeof eq>[]
        >((conditions, [column, value]) => {
          if (isValidColumn(column)) {
            return [
              ...conditions,
              Array.isArray(value)
                ? inArray(collection[column], value)
                : eq(collection[column], value),
            ]
          } else {
            return conditions
          }
        }, []),
      ),
    },
  )
}
