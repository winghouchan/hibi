import { add, sub } from 'date-fns'
import { InferInsertModel } from 'drizzle-orm'
import { chunk, random } from 'lodash'
import { measureAsyncFunction } from 'reassure'
import { Grades } from 'ts-fsrs'
import { collection, collectionToNote } from '@/collections/schema'
import hashNoteFieldValue from '@/notes/hashNoteFieldValue'
import { note, noteField } from '@/notes/schema'
import {
  review,
  reviewable,
  reviewableField,
  reviewableSnapshot,
} from '@/reviews/schema'
import { mockDatabase } from 'test/utils'

/**
 * Splits an array of records to insert into the database into chunks to ensure
 * the number of values to insert is not greater than the limit of parameters
 * allowed in an SQL statement set by SQLite. The default is 999.
 *
 * @see {@link https://sqlite.org/c3ref/c_limit_attached.html#sqlitelimitvariablenumber}
 */
function createChunks<T extends object>(array: T[]) {
  const maxParams = 999

  return chunk(array, Math.floor(maxParams / Object.keys(array[0]).length))
}

describe('getNextReviews', () => {
  test.each([
    {
      name: 'when there is 1 reviewable with 10 reviews',
      variables: {
        collections: 1,
        notes: 1,
        reviews: 10,
      },
    },
    {
      name: 'when there is 1 reviewable with 100 reviews',
      variables: {
        collections: 1,
        notes: 1,
        reviews: 100,
      },
    },
    {
      name: 'when there is 1 reviewable with 1000 reviews',
      variables: {
        collections: 1,
        notes: 1,
        reviews: 1000,
      },
    },
    {
      name: 'when there are 100 reviewables with 10 reviews',
      variables: {
        collections: 1,
        notes: 100,
        reviews: 10,
      },
    },
    {
      name: 'when there are 100 reviewables with 100 reviews',
      variables: {
        collections: 1,
        notes: 100,
        reviews: 100,
      },
    },
    {
      name: 'when there are 100 reviewables with 1000 reviews',
      variables: {
        collections: 1,
        notes: 100,
        reviews: 1000,
      },
    },
    {
      name: 'when there are 1000 reviewables with 10 reviews',
      variables: {
        collections: 1,
        notes: 1000,
        reviews: 10,
      },
    },
    {
      name: 'when there are 1000 reviewables with 100 reviews',
      variables: {
        collections: 1,
        notes: 1000,
        reviews: 100,
      },
    },
  ])(
    '$name',
    async ({ variables }) => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const { default: getNextReviews } = await import('./getNextReviews')
      const ratings = Object.values(Grades).filter(
        (grade) => typeof grade === 'number',
      )

      const collections = await database
        .insert(collection)
        .values(
          Array.from({ length: variables.collections }, (_, index) => ({
            name: `Collection ${index}`,
          })),
        )
        .returning()

      const notes = (
        await Promise.all(
          createChunks(
            Array.from({ length: variables.notes }, () => ({
              reversible: false,
              separable: false,
            })),
          ).map(
            async (values) =>
              await database.insert(note).values(values).returning(),
          ),
        )
      ).flat()

      await Promise.all(
        createChunks(
          notes.map(({ id: note }) => ({
            collection: collections[random(collections.length - 1)].id,
            note,
          })),
        ).map(
          async (values) =>
            await database.insert(collectionToNote).values(values),
        ),
      )

      const noteFields = (
        await Promise.all(
          createChunks(
            notes.flatMap(({ id: note }) => [
              {
                note,
                value: `Note ${note} Front`,
                hash: hashNoteFieldValue(`Note ${note} Front`),
                side: 0,
                position: 0,
                archived: false,
              },
              {
                note,
                value: `Note ${note} Back`,
                hash: hashNoteFieldValue(`Note ${note} Back`),
                side: 1,
                position: 0,
                archived: false,
              },
            ]),
          ).map(
            async (values) =>
              await database.insert(noteField).values(values).returning(),
          ),
        )
      ).flat()

      const reviewables = (
        await Promise.all(
          createChunks(notes.map(({ id: note }) => ({ note }))).map(
            async (values) =>
              await database.insert(reviewable).values(values).returning(),
          ),
        )
      ).flat()

      await Promise.all(
        createChunks(
          noteFields.map(({ id: field, note, side }) => ({
            reviewable: reviewables.find(
              (reviewable) => reviewable.note === note,
            )?.id as InferInsertModel<typeof reviewableField>['reviewable'],
            field,
            side,
          })),
        ).map(
          async (values) =>
            await database.insert(reviewableField).values(values),
        ),
      )

      const weights = Array.from({ length: 19 }, (_, index) => index)

      const reviews = (
        await Promise.all(
          createChunks(
            reviewables.flatMap(({ id: reviewable }) =>
              Array.from({ length: variables.reviews }, (_, index) => ({
                createdAt: sub(new Date(), {
                  days: variables.reviews - index,
                }),

                // Values below are not significant
                dueFuzzed: true,
                duration: random(1000, 10000),
                learningEnabled: true,
                maxInterval: 100,
                rating: ratings[random(ratings.length - 1)],
                retention: 0.8 * 100,
                reviewable,
                weights,
              })),
            ),
          ).map(
            async (values) =>
              await database.insert(review).values(values).returning(),
          ),
        )
      ).flat()

      await Promise.all(
        createChunks(
          reviews.map(({ id: review, reviewable, createdAt }) => ({
            due: add(createdAt, { days: 1 }),
            createdAt,
            review,
            reviewable,

            // Values below are not significant
            difficulty: 1,
            stability: 1,
            state: 1,
          })),
        ).map(
          async (values) =>
            await database.insert(reviewableSnapshot).values(values),
        ),
      )

      await measureAsyncFunction(async () => await getNextReviews())

      resetDatabaseMock()
    },
    180000, // 3 minutes
  )
})
