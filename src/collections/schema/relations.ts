import { relations } from 'drizzle-orm'
import { integer, primaryKey, sqliteTable } from 'drizzle-orm/sqlite-core'
import { createdAt } from '@/data/database/utils'
import { note } from '@/notes/schema/note'
import { collection } from './collection'

export const collectionToNote = sqliteTable(
  'collection_notes',
  {
    collection: integer()
      .notNull()
      .references(() => collection.id),

    note: integer()
      .notNull()
      .references(() => note.id),

    createdAt: createdAt(),
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
