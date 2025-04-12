import { and, eq } from 'drizzle-orm'
import { database, tracer } from '@/data/database'
import { Collection, collection } from '../../schema/collection'

function isValidColumn(column: string): column is keyof Collection {
  return column in collection
}

interface Params {
  filter: Partial<{
    [Key in keyof Collection]: Collection[Key]
  }>
}

async function getCollection({ filter }: Params) {
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

export default tracer.withSpan({ name: 'getCollection' }, getCollection)
