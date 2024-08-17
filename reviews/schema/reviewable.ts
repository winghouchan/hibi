import { createdAt } from '@/database/utils'
import { note, noteField } from '@/notes/schema/note'
import { integer, sqliteTable } from 'drizzle-orm/sqlite-core'

export const reviewable = sqliteTable('reviewable', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  note: integer('note')
    .notNull()
    .references(() => note.id),

  created_at: createdAt(),
})

export const reviewableField = sqliteTable('reviewable_field', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  reviewable: integer('reviewable')
    .notNull()
    .references(() => reviewable.id),

  field: integer('field')
    .notNull()
    .references(() => noteField.id),

  created_at: createdAt(),
})
