import { note } from '@/notes/schema'
import { mockDatabase } from '@/test/utils'
import { review } from './review'
import { reviewable } from './reviewable'

const DEFAULT_SCHEDULER_PARAMETERS_MOCK = {
  is_due_fuzzed: false,
  is_learning_enabled: true,
  max_interval: 36500,
  retention: 90,
  weights: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
}
const REVIEW_INPUTS_MOCK = {
  rating: 1,
  duration: 1000,
}

describe('`review` table', () => {
  describe('`id` column', () => {
    it('is an integer', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      const [{ reviewableId }] = await database
        .insert(reviewable)
        .values({ note: noteId })
        .returning({ reviewableId: reviewable.id })
      const insertReview = async ({ id }: { id: any }) =>
        (
          await database
            .insert(review)
            .values({
              ...DEFAULT_SCHEDULER_PARAMETERS_MOCK,
              ...REVIEW_INPUTS_MOCK,
              reviewable: reviewableId,
              id,
            })
            .returning({ id: review.id })
        )[0]

      await expect(insertReview({ id: 'string' })).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining('datatype mismatch'),
        }),
      )
      await expect(insertReview({ id: 0.1 })).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining('datatype mismatch'),
        }),
      )
      await expect(insertReview({ id: 1 })).resolves.toEqual({ id: 1 })

      resetDatabaseMock()
    })

    it('cannot be `null`', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      const [{ reviewableId }] = await database
        .insert(reviewable)
        .values({ note: noteId })
        .returning({ reviewableId: reviewable.id })
      const insertReviewWithNullId = async () =>
        (
          await database
            .insert(review)
            .values({
              ...DEFAULT_SCHEDULER_PARAMETERS_MOCK,
              ...REVIEW_INPUTS_MOCK,
              reviewable: reviewableId,
              // Cast `null` to `number` so that compile time checks pass and run time checks can be tested
              id: null as unknown as number,
            })
            .returning({ id: review.id })
        )[0]

      const output = await insertReviewWithNullId()

      expect(output).toEqual({ id: 1 })

      resetDatabaseMock()
    })

    it('auto-increments', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      const [{ reviewableId }] = await database
        .insert(reviewable)
        .values({ note: noteId })
        .returning({ reviewableId: reviewable.id })
      const insertReview = async () =>
        (
          await database
            .insert(review)
            .values({
              ...DEFAULT_SCHEDULER_PARAMETERS_MOCK,
              ...REVIEW_INPUTS_MOCK,
              reviewable: reviewableId,
            })
            .returning({ id: review.id })
        )[0]

      const output = [await insertReview(), await insertReview()]

      expect(output).toEqual([{ id: 1 }, { id: 2 }])

      resetDatabaseMock()
    })
  })

  describe('`reviewable` column', () => {
    it('must reference a reviewable', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const insertReview = async () =>
        await database.insert(review).values({
          ...DEFAULT_SCHEDULER_PARAMETERS_MOCK,
          ...REVIEW_INPUTS_MOCK,
          reviewable: 0,
        })

      await expect(insertReview).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining('FOREIGN KEY constraint failed'),
        }),
      )

      resetDatabaseMock()
    })

    it('cannot be `null`', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const insertReview = async () =>
        await database.insert(review).values({
          ...DEFAULT_SCHEDULER_PARAMETERS_MOCK,
          ...REVIEW_INPUTS_MOCK,
          // Cast `null` to `number` so that compile time checks pass and run time checks can be tested
          reviewable: null as unknown as number,
        })

      await expect(insertReview).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: review.reviewable',
          ),
        }),
      )

      resetDatabaseMock()
    })
  })

  describe('`rating` column', () => {
    it('is a valid rating', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      const [{ reviewableId }] = await database
        .insert(reviewable)
        .values({ note: noteId })
        .returning({ reviewableId: reviewable.id })
      const insertReviewWithRating = async (rating: number) =>
        await database.insert(review).values({
          ...DEFAULT_SCHEDULER_PARAMETERS_MOCK,
          ...REVIEW_INPUTS_MOCK,
          reviewable: reviewableId,
          rating,
        })

      await expect(() => insertReviewWithRating(-1)).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining('CHECK constraint failed: rating'),
        }),
      )
      await expect(insertReviewWithRating(0)).toResolve()
      await expect(insertReviewWithRating(1)).toResolve()
      await expect(insertReviewWithRating(2)).toResolve()
      await expect(insertReviewWithRating(3)).toResolve()
      await expect(insertReviewWithRating(4)).toResolve()
      await expect(insertReviewWithRating(5)).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining('CHECK constraint failed: rating'),
        }),
      )

      resetDatabaseMock()
    })

    it('cannot be `null`', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      const [{ reviewableId }] = await database
        .insert(reviewable)
        .values({ note: noteId })
        .returning({ reviewableId: reviewable.id })
      const insertReviewWithRating = async (rating: any) =>
        await database.insert(review).values({
          ...DEFAULT_SCHEDULER_PARAMETERS_MOCK,
          ...REVIEW_INPUTS_MOCK,
          reviewable: reviewableId,
          rating,
        })

      await expect(insertReviewWithRating(undefined)).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: review.rating',
          ),
        }),
      )
      await expect(insertReviewWithRating(null)).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: review.rating',
          ),
        }),
      )

      resetDatabaseMock()
    })
  })

  describe('`duration` column', () => {
    it('is a value greater than 0', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      const [{ reviewableId }] = await database
        .insert(reviewable)
        .values({ note: noteId })
        .returning({ reviewableId: reviewable.id })
      const insertReviewWithDuration = async (duration: number) =>
        await database.insert(review).values({
          ...DEFAULT_SCHEDULER_PARAMETERS_MOCK,
          ...REVIEW_INPUTS_MOCK,
          reviewable: reviewableId,
          duration,
        })

      await expect(insertReviewWithDuration(0)).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining('CHECK constraint failed: duration'),
        }),
      )
      await expect(insertReviewWithDuration(1)).toResolve()

      resetDatabaseMock()
    })

    it('cannot be `null`', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      const [{ reviewableId }] = await database
        .insert(reviewable)
        .values({ note: noteId })
        .returning({ reviewableId: reviewable.id })
      const insertReviewWithDuration = async (duration: any) =>
        await database.insert(review).values({
          ...DEFAULT_SCHEDULER_PARAMETERS_MOCK,
          ...REVIEW_INPUTS_MOCK,
          reviewable: reviewableId,
          duration,
        })

      await expect(insertReviewWithDuration(undefined)).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: review.duration',
          ),
        }),
      )
      await expect(insertReviewWithDuration(null)).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: review.duration',
          ),
        }),
      )

      resetDatabaseMock()
    })
  })

  describe('`created_at` column', () => {
    it('is a date', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      const [{ reviewableId }] = await database
        .insert(reviewable)
        .values({ note: noteId })
        .returning({ reviewableId: reviewable.id })
      const insertReview = async ({ created_at }: { created_at: any }) =>
        (
          await database
            .insert(review)
            .values({
              ...DEFAULT_SCHEDULER_PARAMETERS_MOCK,
              ...REVIEW_INPUTS_MOCK,
              reviewable: reviewableId,
              created_at,
            })
            .returning({ createdAt: review.created_at })
        )[0]
      const now = new Date()

      await expect(insertReview({ created_at: 'string' })).rejects.toThrow()
      await expect(insertReview({ created_at: 0.1 })).rejects.toThrow()
      await expect(insertReview({ created_at: 1 })).rejects.toThrow()
      await expect(insertReview({ created_at: now })).resolves.toEqual({
        createdAt: now,
      })

      resetDatabaseMock()
    })

    it('defaults to _now_', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      const [{ reviewableId }] = await database
        .insert(reviewable)
        .values({ note: noteId })
        .returning({ reviewableId: reviewable.id })
      const insertReview = async () =>
        (
          await database
            .insert(review)
            .values({
              ...DEFAULT_SCHEDULER_PARAMETERS_MOCK,
              ...REVIEW_INPUTS_MOCK,
              reviewable: reviewableId,
            })
            .returning({ createdAt: review.created_at })
        )[0]

      const { createdAt } = await insertReview()

      // The `created_at` datetime is determined in the database and not something that can be mocked.
      // Expect it to be within 1000 ms of when the assertion is executed.
      expect(createdAt).toBeBetween(
        new Date(new Date().valueOf() - 1000),
        new Date(),
      )

      resetDatabaseMock()
    })

    it('cannot be `null`', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      const [{ reviewableId }] = await database
        .insert(reviewable)
        .values({ note: noteId })
        .returning({ reviewableId: reviewable.id })
      const insertReviewWithNullCreatedAt = async () =>
        await database.insert(review).values({
          ...DEFAULT_SCHEDULER_PARAMETERS_MOCK,
          ...REVIEW_INPUTS_MOCK,
          reviewable: reviewableId,
          // Cast `null` to `Date` so that compile time checks pass and run time checks can be tested
          created_at: null as unknown as Date,
        })

      await expect(insertReviewWithNullCreatedAt).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: review.created_at',
          ),
        }),
      )

      resetDatabaseMock()
    })
  })

  describe('`is_due_fuzzed` column', () => {
    it('is a boolean', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      const [{ reviewableId }] = await database
        .insert(reviewable)
        .values({ note: noteId })
        .returning({ reviewableId: reviewable.id })
      const insertReviewWithIsDueFuzzed = async (is_due_fuzzed: any) =>
        (
          await database
            .insert(review)
            .values({
              ...DEFAULT_SCHEDULER_PARAMETERS_MOCK,
              ...REVIEW_INPUTS_MOCK,
              reviewable: reviewableId,
              is_due_fuzzed,
            })
            .returning({ is_due_fuzzed: review.is_due_fuzzed })
        )[0].is_due_fuzzed

      await expect(insertReviewWithIsDueFuzzed(true)).resolves.toBeTrue()
      await expect(insertReviewWithIsDueFuzzed(1)).resolves.toBeTrue()
      await expect(insertReviewWithIsDueFuzzed(0.1)).resolves.toBeTrue()
      await expect(insertReviewWithIsDueFuzzed('string')).resolves.toBeTrue()
      await expect(insertReviewWithIsDueFuzzed([])).resolves.toBeTrue()
      await expect(insertReviewWithIsDueFuzzed({})).resolves.toBeTrue()
      await expect(insertReviewWithIsDueFuzzed(0)).resolves.toBeFalse()
      await expect(insertReviewWithIsDueFuzzed(false)).resolves.toBeFalse()

      resetDatabaseMock()
    })

    it('cannot be `null`', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      const [{ reviewableId }] = await database
        .insert(reviewable)
        .values({ note: noteId })
        .returning({ reviewableId: reviewable.id })
      const insertReviewWithIsDueFuzzed = async (is_due_fuzzed: any) =>
        (
          await database
            .insert(review)
            .values({
              ...DEFAULT_SCHEDULER_PARAMETERS_MOCK,
              ...REVIEW_INPUTS_MOCK,
              reviewable: reviewableId,
              is_due_fuzzed,
            })
            .returning({ is_due_fuzzed: review.is_due_fuzzed })
        )[0].is_due_fuzzed

      await expect(insertReviewWithIsDueFuzzed(undefined)).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: review.is_due_fuzzed',
          ),
        }),
      )
      await expect(insertReviewWithIsDueFuzzed(null)).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: review.is_due_fuzzed',
          ),
        }),
      )

      resetDatabaseMock()
    })
  })

  describe('`is_learning_enabled` column', () => {
    it('is a boolean', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      const [{ reviewableId }] = await database
        .insert(reviewable)
        .values({ note: noteId })
        .returning({ reviewableId: reviewable.id })
      const insertReviewWithIsLearningEnabled = async (
        is_learning_enabled: any,
      ) =>
        (
          await database
            .insert(review)
            .values({
              ...DEFAULT_SCHEDULER_PARAMETERS_MOCK,
              ...REVIEW_INPUTS_MOCK,
              reviewable: reviewableId,
              is_learning_enabled,
            })
            .returning({ is_learning_enabled: review.is_learning_enabled })
        )[0].is_learning_enabled

      await expect(insertReviewWithIsLearningEnabled(true)).resolves.toBeTrue()
      await expect(insertReviewWithIsLearningEnabled(1)).resolves.toBeTrue()
      await expect(insertReviewWithIsLearningEnabled(0.1)).resolves.toBeTrue()
      await expect(
        insertReviewWithIsLearningEnabled('string'),
      ).resolves.toBeTrue()
      await expect(insertReviewWithIsLearningEnabled([])).resolves.toBeTrue()
      await expect(insertReviewWithIsLearningEnabled({})).resolves.toBeTrue()
      await expect(insertReviewWithIsLearningEnabled(0)).resolves.toBeFalse()
      await expect(
        insertReviewWithIsLearningEnabled(false),
      ).resolves.toBeFalse()

      resetDatabaseMock()
    })

    it('cannot be `null`', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      const [{ reviewableId }] = await database
        .insert(reviewable)
        .values({ note: noteId })
        .returning({ reviewableId: reviewable.id })
      const insertReviewWithIsLearningEnabled = async (
        is_learning_enabled: any,
      ) =>
        (
          await database
            .insert(review)
            .values({
              ...DEFAULT_SCHEDULER_PARAMETERS_MOCK,
              ...REVIEW_INPUTS_MOCK,
              reviewable: reviewableId,
              is_learning_enabled,
            })
            .returning({ is_learning_enabled: review.is_learning_enabled })
        )[0].is_learning_enabled

      await expect(
        insertReviewWithIsLearningEnabled(undefined),
      ).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: review.is_learning_enabled',
          ),
        }),
      )
      await expect(insertReviewWithIsLearningEnabled(null)).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: review.is_learning_enabled',
          ),
        }),
      )

      resetDatabaseMock()
    })
  })

  describe('`max_interval` column', () => {
    it('is a value greater than 0', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      const [{ reviewableId }] = await database
        .insert(reviewable)
        .values({ note: noteId })
        .returning({ reviewableId: reviewable.id })
      const insertReviewWithMaxInterval = async (max_interval: number) =>
        await database.insert(review).values({
          ...DEFAULT_SCHEDULER_PARAMETERS_MOCK,
          ...REVIEW_INPUTS_MOCK,
          reviewable: reviewableId,
          max_interval,
        })

      await expect(() => insertReviewWithMaxInterval(0)).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'CHECK constraint failed: max_interval',
          ),
        }),
      )
      await expect(insertReviewWithMaxInterval(1)).toResolve()

      resetDatabaseMock()
    })

    it('cannot be `null`', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      const [{ reviewableId }] = await database
        .insert(reviewable)
        .values({ note: noteId })
        .returning({ reviewableId: reviewable.id })
      const insertReviewWithMaxInterval = async (max_interval: any) =>
        await database.insert(review).values({
          ...DEFAULT_SCHEDULER_PARAMETERS_MOCK,
          ...REVIEW_INPUTS_MOCK,
          reviewable: reviewableId,
          max_interval,
        })

      await expect(() =>
        insertReviewWithMaxInterval(undefined),
      ).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: review.max_interval',
          ),
        }),
      )
      await expect(() => insertReviewWithMaxInterval(null)).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: review.max_interval',
          ),
        }),
      )

      resetDatabaseMock()
    })
  })

  describe('`retention` column', () => {
    it('is a value between 0 and 100 (inclusive)', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      const [{ reviewableId }] = await database
        .insert(reviewable)
        .values({ note: noteId })
        .returning({ reviewableId: reviewable.id })
      const insertReviewWithRetention = async (retention: number) =>
        await database.insert(review).values({
          ...DEFAULT_SCHEDULER_PARAMETERS_MOCK,
          ...REVIEW_INPUTS_MOCK,
          reviewable: reviewableId,
          retention,
        })

      await expect(() => insertReviewWithRetention(-1)).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'CHECK constraint failed: retention',
          ),
        }),
      )
      await expect(insertReviewWithRetention(0)).toResolve()
      await expect(insertReviewWithRetention(100)).toResolve()
      await expect(() => insertReviewWithRetention(101)).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'CHECK constraint failed: retention',
          ),
        }),
      )

      resetDatabaseMock()
    })

    it('cannot be `null`', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      const [{ reviewableId }] = await database
        .insert(reviewable)
        .values({ note: noteId })
        .returning({ reviewableId: reviewable.id })
      const insertReviewWithRetention = async (retention: any) =>
        await database.insert(review).values({
          ...DEFAULT_SCHEDULER_PARAMETERS_MOCK,
          ...REVIEW_INPUTS_MOCK,
          reviewable: reviewableId,
          retention,
        })

      await expect(() => insertReviewWithRetention(undefined)).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: review.retention',
          ),
        }),
      )
      await expect(() => insertReviewWithRetention(null)).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: review.retention',
          ),
        }),
      )

      resetDatabaseMock()
    })
  })

  describe('`weights` column', () => {
    /**
     * There are 19 components to the weight parameter passed to FSRS.
     *
     * @see {@link https://github.com/open-spaced-repetition/ts-fsrs/blob/65fd676414e23e21612b5344af947480f7dafa7e/src/fsrs/default.ts#L6-L10}
     */
    it('is a JSON array with at least 19 items', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      const [{ reviewableId }] = await database
        .insert(reviewable)
        .values({ note: noteId })
        .returning({ reviewableId: reviewable.id })
      const insertReviewWithWeights = async (weights: any) =>
        (
          await database
            .insert(review)
            .values({
              ...DEFAULT_SCHEDULER_PARAMETERS_MOCK,
              ...REVIEW_INPUTS_MOCK,
              reviewable: reviewableId,
              weights,
            })
            .returning()
        )[0]

      const expectedError = expect.objectContaining({
        message: expect.stringContaining(
          'CHECK constraint failed: json_array_length(`weights`) >= 19',
        ),
      })

      await expect(() => insertReviewWithWeights('string')).rejects.toEqual(
        expectedError,
      )
      await expect(() => insertReviewWithWeights(1)).rejects.toEqual(
        expectedError,
      )
      await expect(() => insertReviewWithWeights(0.1)).rejects.toEqual(
        expectedError,
      )
      await expect(() => insertReviewWithWeights({})).rejects.toEqual(
        expectedError,
      )
      await expect(() => insertReviewWithWeights([])).rejects.toEqual(
        expectedError,
      )
      await expect(
        insertReviewWithWeights([
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
        ]),
      ).toResolve()
      await expect(
        insertReviewWithWeights([
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
        ]),
      ).toResolve()

      resetDatabaseMock()
    })

    it('cannot be `null`', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      const [{ reviewableId }] = await database
        .insert(reviewable)
        .values({ note: noteId })
        .returning({ reviewableId: reviewable.id })
      const insertReviewWithWeights = async (weights: any) =>
        (
          await database
            .insert(review)
            .values({
              ...DEFAULT_SCHEDULER_PARAMETERS_MOCK,
              ...REVIEW_INPUTS_MOCK,
              reviewable: reviewableId,
              weights,
            })
            .returning()
        )[0]

      const expectedError = expect.objectContaining({
        message: expect.stringContaining(
          'NOT NULL constraint failed: review.weights',
        ),
      })

      await expect(() => insertReviewWithWeights(undefined)).rejects.toEqual(
        expectedError,
      )
      await expect(() => insertReviewWithWeights(null)).rejects.toEqual(
        expectedError,
      )

      resetDatabaseMock()
    })
  })
})
