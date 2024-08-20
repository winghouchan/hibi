import { collection, collectionToNote } from '@/collections/schema'
import { and, eq, notInArray } from 'drizzle-orm'
import { note } from '../schema/note'

interface UpdateNoteParameters {
  id: Exclude<(typeof note.$inferInsert)['id'], undefined>
  collections?: (typeof collection.$inferSelect)['id'][]
}

export default async function updateNote({
  id,
  collections,
}: UpdateNoteParameters) {
  const { database } = await import('@/database')

  return await database.transaction(async (transaction) => {
    if (collections && collections.length > 0) {
      await transaction
        .delete(collectionToNote)
        .where(
          and(
            eq(collectionToNote.note, id),
            notInArray(collectionToNote.collection, collections),
          ),
        )

      await transaction
        .insert(collectionToNote)
        .values(
          collections.map((collectionId) => ({
            note: id,
            collection: collectionId,
          })),
        )
        .onConflictDoNothing()
    }

    const newState = await transaction.query.note.findFirst({
      where: eq(note.id, id),
      with: {
        collections: {
          columns: {},
          with: { collection: true },
        },
      },
    })

    return {
      ...newState,
      collections:
        newState?.collections.map(({ collection }) => collection) ?? [],
    }
  })
}
