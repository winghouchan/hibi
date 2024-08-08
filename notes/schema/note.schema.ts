import { sql } from 'drizzle-orm'
import { blob, integer, sqliteTable } from 'drizzle-orm/sqlite-core'

export const note = sqliteTable('note', {
  id: integer('id').primaryKey({ autoIncrement: true }),

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

export const noteField = sqliteTable('note_field', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  note: integer('note')
    .references(() => note.id)
    .notNull(),

  /**
   * The value of the field.
   *
   * NOTE: the `value` column has an additional constraint against empty blobs
   * and strings. The migration has been manually modified to include this because
   * Drizzle currently does not have support for adding check constraints.
   *
   * @see {@link https://orm.drizzle.team/docs/indexes-constraints#check | Drizzle Documentation}
   */
  value: blob('value').notNull().$type<Uint8Array | string>(),

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
