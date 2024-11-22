import { and, eq, inArray, notInArray } from 'drizzle-orm'
import differenceWith from 'lodash/differenceWith'
import isEqual from 'lodash/isEqual'
import { RequireAtLeastOne } from 'type-fest'
import { collection, collectionToNote } from '@/collections/schema'
import { database } from '@/data'
import { createReviewables } from '@/reviews'
import { reviewable, reviewableField } from '@/reviews/schema'
import hashNoteFieldValue from '../../hashNoteFieldValue'
import { note, noteField } from '../../schema'

interface Field
  extends Omit<
    typeof noteField.$inferInsert,
    'id' | 'createdAt' | 'hash' | 'note' | 'position' | 'side'
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
  if (collections && collections.length < 1) {
    throw new TypeError('at least 1 collection is required')
  }

  if (sides) {
    if (sides.length !== 2) {
      throw new TypeError('2 sides are required')
    }

    if (!sides.every((side) => side.length > 0)) {
      throw new TypeError('every side requires at least 1 field')
    }
  }

  return database.transaction((transaction) => {
    const currentConfig = transaction.query.note
      .findFirst({
        where: eq(note.id, id),
        columns: {
          reversible: true,
          separable: true,
        },
      })
      .sync()

    if (!currentConfig) {
      throw new Error(`Note ${id} not found`)
    }

    const newConfig = {
      reversible: config?.reversible ?? (currentConfig?.reversible as boolean),
      separable: config?.separable ?? (currentConfig?.separable as boolean),
    }

    if (
      newConfig.reversible !== currentConfig?.reversible ||
      newConfig.separable !== currentConfig.separable
    ) {
      transaction
        .update(note)
        .set({
          reversible: newConfig.reversible,
          separable: newConfig.separable,
        })
        .where(eq(note.id, id))
        .run()
    }

    if (collections && collections.length > 0) {
      transaction
        .delete(collectionToNote)
        .where(
          and(
            eq(collectionToNote.note, id),
            notInArray(collectionToNote.collection, collections),
          ),
        )
        .run()

      transaction
        .insert(collectionToNote)
        .values(
          collections.map((collectionId) => ({
            note: id,
            collection: collectionId,
          })),
        )
        .onConflictDoNothing()
        .run()
    }

    if (sides && sides.length > 0) {
      const currentFields = transaction
        .select()
        .from(noteField)
        .where(eq(noteField.note, id))
        .all()
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

      fieldHashes.map((fieldHash) => {
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
          transaction
            .update(noteField)
            .set({ archived: true })
            .where(and(eq(noteField.note, id), eq(noteField.hash, fieldHash)))
            .run()
        } else if (!currentPositions) {
          // The field had no current positions (i.e. did not exist), so are inserted
          transaction
            .insert(noteField)
            .values(
              newPositions.map(({ position, side }) => ({
                note: id,
                value: sides[side][position].value,
                hash: fieldHash,
                position,
                side,
              })),
            )
            .run()
        } else {
          // The field has positions in both the current and new states

          if (currentPositions.length > newPositions.length) {
            currentPositions.map(({ id, position, side }, index) => {
              if (index > newPositions.length - 1) {
                // The field currently exists at an index that does not exist in the new state, so is archived
                return transaction
                  .update(noteField)
                  .set({ archived: true })
                  .where(eq(noteField.id, id))
                  .run()
              }

              if (
                position !== newPositions[index].position ||
                side !== newPositions[index].side
              ) {
                // The field position is not the same as the position in the new state, so is updated
                return transaction
                  .update(noteField)
                  .set({
                    archived: false,
                    position: newPositions[index].position,
                    side: newPositions[index].side,
                  })
                  .where(eq(noteField.id, id))
                  .run()
              }
            })
          } else {
            newPositions.map(({ position, side }, index) => {
              if (index > currentPositions.length - 1) {
                // The field exists at an index in the new state that does exist in the current state, so is inserted
                return transaction
                  .insert(noteField)
                  .values({
                    note: id,
                    value: sides[side][position].value,
                    hash: fieldHash,
                    position,
                    side,
                  })
                  .run()
              }

              // The field is at an index in both the current and new state
              return transaction
                .update(noteField)
                .set({
                  archived: false,
                  position,
                  side,
                })
                .where(eq(noteField.id, currentPositions[index].id))
                .run()
            })
          }
        }
      })
    }

    if (config || sides) {
      const fieldState = transaction.query.noteField
        .findMany({
          where: and(eq(noteField.note, id), eq(noteField.archived, false)),
        })
        .sync()

      const currentReviewables = transaction.query.reviewable
        .findMany({
          where: eq(reviewable.note, id),
          columns: {
            id: true,
            archived: true,
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
        .sync()

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

              if (reviewable?.archived) {
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

      reviewablesToInsert.map(({ fields }) => {
        const [insertedReviewable] = transaction
          .insert(reviewable)
          .values({
            note: id,
          })
          .returning()
          .all()

        transaction
          .insert(reviewableField)
          .values(
            fields.map(({ field, side }) => ({
              reviewable: insertedReviewable.id,
              field,
              side,
            })),
          )
          .run()
      })

      transaction
        .update(reviewable)
        .set({ archived: true })
        .where(
          inArray(
            reviewable.id,
            reviewablesToArchive.map(({ id }) => id),
          ),
        )
        .run()

      transaction
        .update(reviewable)
        .set({ archived: false })
        .where(
          inArray(
            reviewable.id,
            reviewablesToUnarchive.map(({ id }) => id),
          ),
        )
        .run()
    }

    const newState = transaction.query.note
      .findFirst({
        where: eq(note.id, id),
        with: {
          collections: {
            columns: {},
            with: { collection: true },
          },
          fields: {
            where: eq(noteField.archived, false),
          },
        },
      })
      .sync()

    return {
      ...newState,
      collections:
        newState?.collections.map(({ collection }) => collection) ?? [],
      fields: newState?.fields ?? [],
    }
  })
}
