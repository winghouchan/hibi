import { collection, collectionToNote } from '@/collections/schema'
import { createReviewables } from '@/reviews'
import { reviewable, reviewableField } from '@/reviews/schema'
import { and, eq, inArray, notInArray } from 'drizzle-orm'
import differenceWith from 'lodash/differenceWith'
import isEqual from 'lodash/isEqual'
import { RequireAtLeastOne } from 'type-fest'
import hashNoteFieldValue from '../hashNoteFieldValue'
import { note, noteField } from '../schema'

interface Field
  extends Omit<
    typeof noteField.$inferInsert,
    'id' | 'created_at' | 'hash' | 'note' | 'position' | 'side'
  > {}

type UpdateNoteParameters = {
  id: Exclude<(typeof note.$inferInsert)['id'], undefined>
} & RequireAtLeastOne<
  {
    collections?: (typeof collection.$inferSelect)['id'][]
    config?: Partial<Parameters<typeof createReviewables>[0]['config']>
    fields?: Field[][]
  },
  'collections' | 'config' | 'fields'
>

export default async function updateNote({
  id,
  collections,
  fields: sides,
  config,
}: UpdateNoteParameters) {
  const { database } = await import('@/database')

  return await database.transaction(async (transaction) => {
    const currentConfig = await transaction.query.note.findFirst({
      where: eq(note.id, id),
      columns: {
        is_reversible: true,
        is_separable: true,
      },
    })

    const newConfig = {
      reversible:
        config?.reversible ?? (currentConfig?.is_reversible as boolean),
      separable: config?.separable ?? (currentConfig?.is_separable as boolean),
    }

    if (
      newConfig.reversible !== currentConfig?.is_reversible ||
      newConfig.separable !== currentConfig.is_separable
    ) {
      await transaction
        .update(note)
        .set({
          is_reversible: newConfig.reversible,
          is_separable: newConfig.separable,
        })
        .where(eq(note.id, id))
    }

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

    if (sides && sides.length > 0) {
      const currentFields = await transaction
        .select()
        .from(noteField)
        .where(eq(noteField.note, id))
      const currentFieldPositionsByHash = currentFields.reduce<
        Record<
          (typeof noteField.$inferSelect)['hash'],
          Pick<typeof noteField.$inferSelect, 'id' | 'side' | 'position'>[]
        >
      >(
        (state, current) => ({
          ...state,
          [current.hash]: [
            ...(state[current.hash] ?? []),
            { id: current.id, side: current.side, position: current.position },
          ],
        }),
        {},
      )
      const newFieldPositionsByHash = sides.reduce<
        Record<
          (typeof noteField.$inferSelect)['hash'],
          Pick<typeof noteField.$inferInsert, 'side' | 'position'>[]
        >
      >((state, fields, side) => {
        const newState = {
          ...state,
        }

        fields.forEach((field, position) => {
          const fieldHash = hashNoteFieldValue(field.value)

          newState[fieldHash] = [
            ...(newState[fieldHash] ?? []),
            { side, position },
          ]
        })

        return newState
      }, {})
      const fieldHashes = [
        ...new Set([
          ...Object.keys(currentFieldPositionsByHash),
          ...Object.keys(newFieldPositionsByHash),
        ]),
      ]

      await Promise.all(
        fieldHashes.map(async (fieldHash) => {
          /**
           * Current positions of the field identifed by the hash of its value
           */
          const currentPositions = currentFieldPositionsByHash[fieldHash]
          /**
           * New positions of the field identifed by the hash of its value
           */
          const newPositions = newFieldPositionsByHash[fieldHash]

          if (!newPositions) {
            // The field has no positions in the new state, so are archived
            await transaction
              .update(noteField)
              .set({ is_archived: true })
              .where(and(eq(noteField.note, id), eq(noteField.hash, fieldHash)))
          } else if (!currentPositions) {
            // The field had no current positions (i.e. did not exist), so are inserted
            await transaction.insert(noteField).values(
              newPositions.map(({ position, side }) => ({
                note: id,
                value: sides[side][position].value,
                hash: fieldHash,
                position,
                side,
              })),
            )
          } else {
            // The field has positions in both the current and new states

            if (currentPositions.length > newPositions.length) {
              await Promise.all(
                currentPositions.map(async ({ id, position, side }, index) => {
                  if (index > newPositions.length - 1) {
                    // The field currently exists at an index that does not exist in the new state, so is archived
                    return await transaction
                      .update(noteField)
                      .set({ is_archived: true })
                      .where(eq(noteField.id, id))
                  }

                  if (
                    position !== newPositions[index].position ||
                    side !== newPositions[index].side
                  ) {
                    // The field position is not the same as the position in the new state, so is updated
                    return await transaction
                      .update(noteField)
                      .set({
                        is_archived: false,
                        position: newPositions[index].position,
                        side: newPositions[index].side,
                      })
                      .where(eq(noteField.id, id))
                  }
                }),
              )
            } else {
              await Promise.all(
                newPositions.map(async ({ position, side }, index) => {
                  if (index > currentPositions.length - 1) {
                    // The field exists at an index in the new state that does exist in the current state, so is inserted
                    return await transaction.insert(noteField).values({
                      note: id,
                      value: sides[side][position].value,
                      hash: fieldHash,
                      position,
                      side,
                    })
                  }

                  // The field is at an index in both the current and new state
                  return await transaction
                    .update(noteField)
                    .set({
                      is_archived: false,
                      position,
                      side,
                    })
                    .where(eq(noteField.id, currentPositions[index].id))
                }),
              )
            }
          }
        }),
      )
    }

    if (config || sides) {
      const fieldState = await transaction.query.noteField.findMany({
        where: eq(noteField.note, id),
      })

      const currentReviewables = await transaction.query.reviewable.findMany({
        where: eq(reviewable.note, id),
        columns: {
          id: true,
          is_archived: true,
        },
        with: {
          fields: {
            columns: {
              field: true,
              side: true,
            },
          },
        },
      })

      const newReviewables = createReviewables({
        config: newConfig,
        note: { id, fields: fieldState },
      })

      const reviewablesToInsert = []
      const reviewablesToUnarchive = []

      for (
        let newReviewableIndex = 0,
          newReviewablesLastIndex = newReviewables.length - 1;
        newReviewableIndex <= newReviewablesLastIndex;
        newReviewableIndex++
      ) {
        if (currentReviewables.length === 0) {
          reviewablesToInsert.push(newReviewables[newReviewableIndex])
        } else {
          for (
            let currentReviewableIndex = 0,
              currentReviewablesLastIndex = currentReviewables.length - 1;
            currentReviewableIndex <= currentReviewablesLastIndex;
            currentReviewableIndex++
          ) {
            const newFields = newReviewables[newReviewableIndex].fields
            const currentFields =
              currentReviewables[currentReviewableIndex].fields

            if (
              newFields.length === currentFields.length &&
              differenceWith(newFields, currentFields, isEqual).length === 0
            ) {
              const reviewable = currentReviewables.shift()

              if (reviewable?.is_archived) {
                reviewablesToUnarchive.push(reviewable)
              }

              break
            }

            if (currentReviewableIndex === currentReviewablesLastIndex) {
              reviewablesToInsert.push(newReviewables[newReviewableIndex])
            }
          }
        }
      }

      const reviewablesToArchive = currentReviewables

      await Promise.all(
        reviewablesToInsert.map(async ({ fields }) => {
          const [insertedReviewable] = await transaction
            .insert(reviewable)
            .values({
              note: id,
            })
            .returning()

          await transaction.insert(reviewableField).values(
            fields.map(({ field, side }) => ({
              reviewable: insertedReviewable.id,
              field,
              side,
            })),
          )
        }),
      )

      await transaction
        .update(reviewable)
        .set({ is_archived: true })
        .where(
          inArray(
            reviewable.id,
            reviewablesToArchive.map(({ id }) => id),
          ),
        )

      await transaction
        .update(reviewable)
        .set({ is_archived: false })
        .where(
          inArray(
            reviewable.id,
            reviewablesToUnarchive.map(({ id }) => id),
          ),
        )
    }

    const newState = await transaction.query.note.findFirst({
      where: eq(note.id, id),
      with: {
        collections: {
          columns: {},
          with: { collection: true },
        },
        fields: {
          where: eq(noteField.is_archived, false),
        },
      },
    })

    return {
      ...newState,
      collections:
        newState?.collections.map(({ collection }) => collection) ?? [],
      fields: newState?.fields ?? [],
    }
  })
}
