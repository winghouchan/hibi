import { sql } from 'drizzle-orm'
import {
  blob,
  check,
  integer,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core'
import { createdAt } from '@/data/database/utils'
import { note } from './note'

export const noteField = sqliteTable(
  'note_field',
  {
    id: integer().primaryKey({ autoIncrement: true }),

    note: integer()
      .references(() => note.id)
      .notNull(),

    value: blob().notNull().$type<Uint8Array | string>(),

    /**
     * A hash of the value of the field.
     *
     * SHA-256 is the algorithm used as there is only a very small risk of
     * ollision and it has acceptable performance. The digest is stored in
     * base64 to reduce the storage size compared to hexadecimal and improve
     * the ease of use compared to binary.
     */
    hash: text().notNull(),

    side: integer().notNull(),

    position: integer().notNull(),

    archived: integer('is_archived', { mode: 'boolean' })
      .notNull()
      .default(false),

    createdAt: createdAt(),
  },
  ({ value, hash, side, position, archived }) => [
    check('note_field_value_not_empty', sql`length(${value}) > 0`),

    /**
     * A constraint to reduce the risk of the hash not being a base64 encoded
     * SHA-256 hash. Base64 encoded SHA-256 hashes have a length of 44 bytes.
     */
    check('note_field_hash_length', sql`length(${hash}) = 44`),

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
    check('note_field_side_is_valid', sql`${side} IN (0, 1)`),

    check('note_field_position_is_not_negative', sql`${position} >= 0`),

    check('note_field_archived_is_boolean', sql`${archived} IN (true, false)`),
  ],
)
