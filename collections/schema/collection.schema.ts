import { sql } from 'drizzle-orm'
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

  /**
   * The timestamp of when the collection was created, represented as milliseconds
   * since Unix epoch.
   *
   * NOTE: uses `unixepoch()` as opposed to `current_timestamp` because `current_timestamp`
   * returns a string representation with the format `YYYY-MM-DD HH:MM:SS` as opposed to
   * seconds/milliseconds since Unix epoch.
   *
   * @see {@link https://www.sqlite.org/lang_createtable.html#the_default_clause | SQLite Documentation for `current_timestamp`}
   * @see {@link https://www.sqlite.org/lang_datefunc.html | SQLite Documentation for `unixepoch()`}
   */
  created_at: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch('now', 'subsec') * 1000)`),
})
