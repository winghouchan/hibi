import { createdAt } from '@/database/utils'
import { blob, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const note = sqliteTable('note', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  /**
   * Determines if the note's prompt/answer fields can be reversed so that the
   * prompts can be used as answers and answers can be used as prompts.
   */
  is_reversible: integer('is_reversible', { mode: 'boolean' })
    .notNull()
    .default(false),

  /**
   * Determines if each note field can be combined with another note field in a
   * prompt/answer relationship.
   */
  is_separable: integer('is_separable', { mode: 'boolean' })
    .notNull()
    .default(false),

  created_at: createdAt(),
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
   * A hash of the value of the field.
   *
   * SHA-256 is the algorithm currently used as there is a very small risk of
   * collision and it has acceptable performance. The digest is stored in base64
   * to reduce the storage size compared to hexadecimal and improve the ease of
   * use compared to binary.
   */
  hash: text('hash').notNull(),

  position: integer('position').notNull(),

  is_archived: integer('is_archived', { mode: 'boolean' })
    .notNull()
    .default(false),

  created_at: createdAt(),
})
