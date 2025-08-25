import { sql } from 'drizzle-orm'
import {
  check,
  customType,
  integer,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core'
import { createdAt } from '@/data/database/utils'
import { note } from './note'

/**
 * The built-in `blob` from Drizzle was updated to always return a buffer while
 * SQLite stores data in the blob column exactly as input. We want our blob column
 * to be able to store strings and blobs and return them as is. This custom type
 * enables this behaviour.
 *
 * @see {@link https://github.com/drizzle-team/drizzle-orm/blob/027921fda2ba61fd6271e49a576e1abd76613fc1/drizzle-orm/src/sqlite-core/columns/blob.ts}
 * @see {@link https://www.sqlite.org/datatype3.html}
 */
const blob = customType<{ data: string | Uint8Array }>({
  dataType() {
    return 'blob'
  },
})

export const noteField = sqliteTable(
  'note_field',
  {
    id: integer().primaryKey({ autoIncrement: true }),

    note: integer()
      .references(() => note.id)
      .notNull(),

    /**
     * The media type of the value of the field.
     *
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types}
     */
    type: text().notNull(),

    value: blob().notNull(),

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
  ({ type, value, hash, side, position, archived }) => [
    /**
     * A constraint to reduce the risk of an invalid media type. Media types
     * come in the form `<type>/<subtype`.
     *
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types}
     */
    check('note_field_type_is_valid', sql`${type} LIKE '%/%'`),

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
