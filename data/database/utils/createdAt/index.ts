import { sql } from 'drizzle-orm'
import { integer } from 'drizzle-orm/sqlite-core'

/**
 * A utility function for declaring a column that stores the timestamp of when
 * a database record was created. The timestamp is represented as milliseconds
 * since Unix epoch. The function optionally accepts a column name, with the
 * default being `created_at`.
 *
 * Example usage:
 *
 * ```
 * const table = sqliteTable('table', {
 *   created_at: createdAt()
 * })
 * ```
 *
 * NOTE: uses `unixepoch()` as opposed to `current_timestamp` because `current_timestamp`
 * returns a string representation with the format `YYYY-MM-DD HH:MM:SS` as opposed to
 * seconds/milliseconds since Unix epoch.
 *
 * @see {@link https://www.sqlite.org/lang_createtable.html#the_default_clause | SQLite Documentation for `current_timestamp`}
 * @see {@link https://www.sqlite.org/lang_datefunc.html | SQLite Documentation for `unixepoch()`}
 */
export default function createdAt(columnName = 'created_at') {
  return integer(columnName, { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch('now', 'subsec') * 1000)`)
}
