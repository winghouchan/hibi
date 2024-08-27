import { collection, collectionToNote } from '@/collections/schema'
import { createReviewables } from '@/reviews'
import { reviewable, reviewableField } from '@/reviews/schema/reviewable'
import { inArray } from 'drizzle-orm'
import hash from 'sha.js'
import { noteField, note } from '../schema/note'

interface Field
  extends Omit<
    typeof noteField.$inferInsert,
    'id' | 'created_at' | 'hash' | 'note' | 'position'
  > {}

interface Note extends Omit<typeof note.$inferInsert, 'id' | 'created_at'> {
  fields: Field[]
  collections: (typeof collection.$inferSelect)['id'][]
}

interface CreateNoteParameters {
  note: Note
  config: Parameters<typeof createReviewables>[0]['config']
}

export default async function createNote({
  note: { collections, fields },
  config,
}: CreateNoteParameters) {
  const { database } = await import('@/database')

  if (collections.length < 1) {
    throw new TypeError('at least 1 collection is required')
  }

  if (fields.length < 2) {
    throw new TypeError('at least 2 fields are required')
  }

  return await database.transaction(async (transaction) => {
    const [insertedNote] = await transaction
      .insert(note)
      .values({
        is_reversible: config.reversible,
        is_separable: config.separable,
      })
      .returning()

    const insertedFields = await transaction
      .insert(noteField)
      .values(
        fields.map((field, index) => ({
          ...field,
          note: insertedNote.id,
          hash: hash('sha256').update(field.value).digest('base64'),
          position: index,
        })),
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
            fields.map(({ field }) => ({
              reviewable: insertedReviewable.id,
              field,
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
