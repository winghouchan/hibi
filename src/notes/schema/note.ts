import { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { integer, sqliteTable } from 'drizzle-orm/sqlite-core'
import { createdAt } from '@/data/database/utils'

export const note = sqliteTable('note', {
  id: integer().primaryKey({ autoIncrement: true }),

  /**
   * Determines if the note's prompt/answer fields can be reversed so that the
   * prompts can be used as answers and answers can be used as prompts.
   */
  reversible: integer('is_reversible', { mode: 'boolean' })
    .notNull()
    .default(false),

  /**
   * Determines if each note field can be combined with another note field in a
   * prompt/answer relationship.
   */
  separable: integer('is_separable', { mode: 'boolean' })
    .notNull()
    .default(false),

  createdAt: createdAt(),
})

export type Note = InferSelectModel<typeof note>
export type NoteParameters = InferInsertModel<typeof note>
