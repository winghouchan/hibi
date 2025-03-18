import {
  asc,
  and,
  desc,
  eq,
  getTableColumns,
  gt,
  gte,
  inArray,
  lt,
  lte,
} from 'drizzle-orm'
import { collection } from '@/collections/schema'
import { database } from '@/data/database'

type Collection = typeof collection.$inferSelect

function isValidColumn(column: string): column is keyof Collection {
  return column in collection
}

interface Options {
  filter?: {
    [Key in keyof Collection]?: Collection[Key][]
  }
  order?: {
    id?: 'asc' | 'desc'
  }
  pagination?: {
    cursor?: number
    limit?: number
  }
}

const PAGINATION_DEFAULT_LIMIT = 10

export default async function getCollections({
  filter,
  order,
  pagination,
}: Options = {}) {
  const filterConditions = filter
    ? Object.entries(filter).reduce<ReturnType<typeof inArray | typeof eq>[]>(
        (conditions, [column, value]) => {
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
        },
        [],
      )
    : []

  const collections = await database
    .select(getTableColumns(collection))
    .from(collection)
    .where(
      and(
        pagination?.cursor
          ? order?.id === 'desc'
            ? lte(collection.id, pagination.cursor)
            : gte(collection.id, pagination.cursor)
          : undefined,
        ...filterConditions,
      ),
    )
    .limit(pagination?.limit ?? PAGINATION_DEFAULT_LIMIT)
    .orderBy(order?.id === 'desc' ? desc(collection.id) : asc(collection.id))

  return {
    cursor: {
      next:
        collections.length > 0
          ? (
              await database
                .select({ id: collection.id })
                .from(collection)
                .where(
                  and(
                    order?.id === 'desc'
                      ? lt(
                          collection.id,
                          collections[collections.length - 1].id,
                        )
                      : gt(
                          collection.id,
                          collections[collections.length - 1].id,
                        ),
                    ...filterConditions,
                  ),
                )
                .orderBy(
                  order?.id === 'desc'
                    ? desc(collection.id)
                    : asc(collection.id),
                )
                .limit(1)
            ).at(0)?.id
          : undefined,
    },
    collections,
  }
}
