import { createdAt } from '@/data/database/utils'
import { blob, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { note } from './note'

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

  side: integer('side').notNull(),

  position: integer('position').notNull(),

  archived: integer('is_archived', { mode: 'boolean' })
    .notNull()
    .default(false),

  createdAt: createdAt(),
})
