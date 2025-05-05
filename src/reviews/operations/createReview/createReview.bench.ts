import { add, sub } from 'date-fns'
import { chunk, random } from 'lodash'
import { measureAsyncFunction } from 'reassure'
import { Grades, Rating } from 'ts-fsrs'
import { review, reviewableSnapshot } from '@/reviews/schema'
import { mockDatabase } from 'test/utils'

const ratings = Object.values(Grades).filter(
  (grade) => typeof grade === 'number',
)

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

const fixture = {
  collection: {
    name: 'Collection Name',
  },
  note: {
    fields: [[{ value: 'Front' }], [{ value: 'Back' }]],
    config: { reversible: false, separable: false },
  },
}

const input = {
  rating: Grades[Rating.Again],
  duration: 2000,
}

describe('createReview', () => {
  test.each([
    {
      name: 'when creating a review for a reviewable that has 0 reviews',
      variables: {
        reviews: 0,
      },
    },
    {
      name: 'when creating a review for a reviewable that has 1 review',
      variables: {
        reviews: 1,
      },
    },
    {
      name: 'when creating a review for a reviewable that has 10 reviews',
      variables: {
        reviews: 10,
      },
    },
    {
      name: 'when creating a review for a reviewable that has 100 reviews',
      variables: {
        reviews: 100,
      },
    },
  ])('$name', async ({ variables }) => {
    const { database, resetDatabaseMock } = await mockDatabase()
    const { createCollection } = await import('@/collections/operations')
    const { createNote } = await import('@/notes/operations')
    const { default: createReview } = await import('./createReview')

    const collection = await createCollection(fixture.collection)
    const note = await createNote({
      collections: [collection.id],
      ...fixture.note,
    })
    const reviewable = note.reviewables[0].id

    if (variables.reviews) {
      const weights = Array.from({ length: 19 }, (_, index) => index)

      const reviews = (
        await Promise.all(
          createChunks(
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
    }

    await measureAsyncFunction(
      async () =>
        await createReview({
          reviewable,
          ...input,
        }),
    )

    resetDatabaseMock()
  })
})
