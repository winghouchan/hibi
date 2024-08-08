import { note, noteField } from '@/notes/schema/note.schema'
import { sql } from 'drizzle-orm'
import { integer, sqliteTable } from 'drizzle-orm/sqlite-core'

export const reviewable = sqliteTable('reviewable', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  note: integer('note')
    .notNull()
    .references(() => note.id),

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

export const reviewableField = sqliteTable('reviewable_field', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  reviewable: integer('reviewable')
    .notNull()
    .references(() => reviewable.id),

  field: integer('field')
    .notNull()
    .references(() => noteField.id),

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
