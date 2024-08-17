import { createdAt } from '@/database/utils'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const collection = sqliteTable('collection', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  /**
   * The name of the collection.
   *
   * NOTE: the `name` column has an additional constraint against empty strings.
   * The migration has been manually modified to include this because Drizzle
   * currently does not have support for adding check constraints.
   *
   * @see {@link https://orm.drizzle.team/docs/indexes-constraints#check | Drizzle Documentation}
   */
  name: text('name').notNull(),

  created_at: createdAt(),
})
