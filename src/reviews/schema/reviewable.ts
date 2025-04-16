import { InferInsertModel, InferSelectModel, sql } from 'drizzle-orm'
import { check, integer, sqliteTable } from 'drizzle-orm/sqlite-core'
import { createdAt } from '@/data/database/utils'
import { note } from '@/notes/schema/note'
import { noteField } from '@/notes/schema/noteField'

export const reviewable = sqliteTable(
  'reviewable',
  {
    id: integer().primaryKey({ autoIncrement: true }),

    note: integer()
      .notNull()
      .references(() => note.id),

    archived: integer('is_archived', { mode: 'boolean' })
      .notNull()
      .default(false),

    createdAt: createdAt(),
  },
  ({ archived }) => [
    check('reviewable_archived_is_boolean', sql`${archived} IN (true, false)`),
  ],
)

export type Reviewable = InferSelectModel<typeof reviewable>
export type ReviewableParameters = InferInsertModel<typeof reviewable>

export const reviewableField = sqliteTable(
  'reviewable_field',
  {
    id: integer().primaryKey({ autoIncrement: true }),

    reviewable: integer()
      .notNull()
      .references(() => reviewable.id),

    field: integer()
      .notNull()
      .references(() => noteField.id),

    side: integer().notNull(),

    createdAt: createdAt(),
  },
  ({ side }) => [
    /**
     * A constraint to check the side is valid.
     *
     * A side represents the order in which a set of fields are shown to the
     * user. In a flashcard, the front would be shown first, followed by the
     * back.
     *
     * Currently, this constraint only allows two possible sides as the app
     * does not handle more than 2 sides, however, in theory more sides could
     * be included.
     */
    check('reviewable_field_side_is_valid', sql`${side} IN (0, 1)`),
  ],
)

export type ReviewableField = InferSelectModel<typeof reviewableField>
export type ReviewableFieldParameters = InferInsertModel<typeof reviewableField>
