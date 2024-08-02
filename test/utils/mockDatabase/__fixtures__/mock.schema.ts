import { integer, sqliteTable } from 'drizzle-orm/sqlite-core'

export const mock = sqliteTable('mock', {
  mock_column: integer('mock_column').primaryKey(),
})
