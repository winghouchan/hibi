import { InferInsertModel, InferSelectModel, sql } from 'drizzle-orm'
import { check, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createdAt } from '@/data/database/utils'

export const collection = sqliteTable(
  'collection',
  {
    id: integer().primaryKey({ autoIncrement: true }),

    name: text().notNull(),

    createdAt: createdAt(),
  },
  ({ name }) => [check('collection_name_not_empty_string', sql`${name} != ''`)],
)

export type Collection = InferSelectModel<typeof collection>
export type CollectionParameters = InferInsertModel<typeof collection>
