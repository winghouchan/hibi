import { createdAt } from '@/database/utils'
import { note } from '@/notes/schema/note'
import { noteField } from '@/notes/schema/noteField'
import { integer, sqliteTable } from 'drizzle-orm/sqlite-core'

export const reviewable = sqliteTable('reviewable', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  note: integer('note')
    .notNull()
    .references(() => note.id),

  is_archived: integer('is_archived', { mode: 'boolean' })
    .notNull()
    .default(false),

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

  side: integer('side').notNull(),

  created_at: createdAt(),
})
