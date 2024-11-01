import { createdAt } from '@/data/database/utils'
import { sql } from 'drizzle-orm'
import { check, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const collection = sqliteTable(
  'collection',
  {
    id: integer().primaryKey({ autoIncrement: true }),

    name: text().notNull(),

    createdAt: createdAt(),
  },
  ({ name }) => ({
    nameNotEmptyString: check(
      'collection_name_not_empty_string',
      sql`${name} != ''`,
    ),
  }),
)
