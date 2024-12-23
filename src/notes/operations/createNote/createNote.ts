import { inArray } from 'drizzle-orm'
import { collection, collectionToNote } from '@/collections/schema'
import { database } from '@/data'
import { createReviewables } from '@/reviews'
import { reviewable, reviewableField } from '@/reviews/schema/reviewable'
import hashNoteFieldValue from '../../hashNoteFieldValue'
import { noteField, note } from '../../schema'

interface Field
  extends Omit<
    typeof noteField.$inferInsert,
    'id' | 'createdAt' | 'hash' | 'note' | 'position' | 'side'
  > {}

interface CreateNoteParameters {
  collections: (typeof collection.$inferSelect)['id'][]
  fields: Field[][]
  config: Parameters<typeof createReviewables>[0]['config']
}

export default async function createNote({
  collections,
  fields: sides,
  config,
}: CreateNoteParameters) {
  if (collections.length < 1) {
    throw new TypeError('at least 1 collection is required')
  }

  if (sides.length !== 2) {
    throw new TypeError('2 sides are required')
  }

  if (!sides.every((side) => side.length > 0)) {
    throw new TypeError('every side requires at least 1 field')
  }

  return await database.transaction(async (transaction) => {
    const [insertedNote] = await transaction
      .insert(note)
      .values({
        reversible: config.reversible,
        separable: config.separable,
      })
      .returning()

    const insertedFields = await transaction
      .insert(noteField)
      .values(
        sides.reduce<(typeof noteField.$inferInsert)[]>(
          (state, fields, side) => [
            ...state,
            ...fields.map((field, position) => ({
              ...field,
              note: insertedNote.id,
              hash: hashNoteFieldValue(field.value),
              position,
              side,
            })),
          ],
          [],
        ),
      )
      .returning()

    await transaction.insert(collectionToNote).values(
      collections.map((collection) => ({
        collection,
        note: insertedNote.id,
      })),
    )

    const noteCollections = await transaction.query.collection.findMany({
      where: inArray(collection.id, collections),
    })

    const reviewables = await Promise.all(
      createReviewables({
        note: { id: insertedNote.id, fields: insertedFields },
        config,
      }).map(async ({ note: noteId, fields }) => {
        const [insertedReviewable] = await transaction
          .insert(reviewable)
          .values({ note: noteId })
          .returning()

        const insertedReviewableFields = await transaction
          .insert(reviewableField)
          .values(
            fields.map(({ field, side }) => ({
              reviewable: insertedReviewable.id,
              field,
              side,
            })),
          )
          .returning()

        return {
          ...insertedReviewable,
          fields: insertedReviewableFields,
          reviews: [],
        }
      }),
    )

    return {
      ...insertedNote,
      collections: noteCollections,
      fields: insertedFields,
      reviewables,
    }
  })
}
