import { note } from '@/notes/schema/note.schema'
import { relations, sql } from 'drizzle-orm'
import { integer, primaryKey, sqliteTable } from 'drizzle-orm/sqlite-core'
import { collection } from './collection.schema'

export const collectionToNote = sqliteTable(
  'collection_notes',
  {
    collection: integer('collection')
      .notNull()
      .references(() => collection.id),

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
  },
  (table) => ({
    pk: primaryKey({ columns: [table.collection, table.note] }),
  }),
)

export const collectionRelations = relations(collection, ({ many }) => ({
  notes: many(collectionToNote),
}))

export const collectionToNoteRelations = relations(
  collectionToNote,
  ({ one }) => ({
    collection: one(collection, {
      fields: [collectionToNote.collection],
      references: [collection.id],
    }),
    note: one(note, {
      fields: [collectionToNote.note],
      references: [note.id],
    }),
  }),
)
