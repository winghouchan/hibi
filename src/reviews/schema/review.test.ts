import { note } from '@/notes/schema'
import { mockDatabase } from 'test/utils'
import { Review, ReviewParameters, review } from './review'
import { reviewable } from './reviewable'

type DatabaseMock = Awaited<ReturnType<typeof mockDatabase>>
type Any<Type> = {
  [Property in keyof Type]: any
}

describe('`review` table', () => {
  let database: DatabaseMock['database'],
    resetDatabaseMock: DatabaseMock['resetDatabaseMock'],
    reviewMock: Pick<
      Review,
      | 'reviewable'
      | 'rating'
      | 'duration'
      | 'dueFuzzed'
      | 'learningEnabled'
      | 'maxInterval'
      | 'retention'
      | 'weights'
    >,
    insertReview: (values: Any<ReviewParameters>) => Promise<Review>

  beforeEach(async () => {
    ;({ database, resetDatabaseMock } = await mockDatabase())

    const [{ noteId }] = await database
      .insert(note)
      .values({})
      .returning({ noteId: note.id })
    const [{ reviewableId }] = await database
      .insert(reviewable)
      .values({ note: noteId })
      .returning({ reviewableId: reviewable.id })

    reviewMock = {
      reviewable: reviewableId,
      rating: 1,
      duration: 1000,
      dueFuzzed: false,
      learningEnabled: true,
      maxInterval: 36500,
      retention: 90,
      weights: [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
      ],
    }

    insertReview = async (values) =>
      (await database.insert(review).values(values).returning())[0]
  })

  afterEach(() => {
    resetDatabaseMock()
  })

  describe('`id` column', () => {
    it('is an integer', async () => {
      const datatypeMismatch = expect.objectContaining({
        message: expect.stringContaining('datatype mismatch'),
      })

      await expect(
        insertReview({ ...reviewMock, id: 'string' }),
      ).rejects.toEqual(datatypeMismatch)
      await expect(insertReview({ ...reviewMock, id: 0.1 })).rejects.toEqual(
        datatypeMismatch,
      )
      await expect(insertReview({ ...reviewMock, id: 1 })).resolves.toEqual(
        expect.objectContaining({
          id: expect.any(Number),
        }),
      )
    })

    it('cannot be `null`', async () => {
      await expect(
        insertReview({ ...reviewMock, id: undefined }),
      ).resolves.toEqual(expect.objectContaining({ id: expect.any(Number) }))
      await expect(insertReview({ ...reviewMock, id: null })).resolves.toEqual(
        expect.objectContaining({ id: expect.any(Number) }),
      )
    })

    it('auto-increments', async () => {
      const output = [
        await insertReview(reviewMock),
        await insertReview(reviewMock),
      ]

      expect(output).toEqual([
        expect.objectContaining({ id: 1 }),
        expect.objectContaining({ id: 2 }),
      ])
    })
  })

  describe('`reviewable` column', () => {
    it('must reference a reviewable', async () => {
      await expect(
        insertReview({ ...reviewMock, reviewable: 0 }),
      ).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining('FOREIGN KEY constraint failed'),
        }),
      )
    })

    it('cannot be `null`', async () => {
      const notNullConstraintFailed = expect.objectContaining({
        message: expect.stringContaining(
          'NOT NULL constraint failed: review.reviewable',
        ),
      })

      await expect(
        insertReview({ ...reviewMock, reviewable: undefined }),
      ).rejects.toEqual(notNullConstraintFailed)
      await expect(
        insertReview({ ...reviewMock, reviewable: null }),
      ).rejects.toEqual(notNullConstraintFailed)
    })
  })

  describe('`rating` column', () => {
    it('is a valid rating', async () => {
      const checkConstraintFailed = expect.objectContaining({
        message: expect.stringContaining('CHECK constraint failed'),
      })

      await expect(insertReview({ ...reviewMock, rating: -1 })).rejects.toEqual(
        checkConstraintFailed,
      )
      await expect(insertReview({ ...reviewMock, rating: 0 })).toResolve()
      await expect(insertReview({ ...reviewMock, rating: 1 })).toResolve()
      await expect(insertReview({ ...reviewMock, rating: 2 })).toResolve()
      await expect(insertReview({ ...reviewMock, rating: 3 })).toResolve()
      await expect(insertReview({ ...reviewMock, rating: 4 })).toResolve()
      await expect(insertReview({ ...reviewMock, rating: 5 })).rejects.toEqual(
        checkConstraintFailed,
      )
    })

    it('cannot be `null`', async () => {
      const notNullConstraintFailed = expect.objectContaining({
        message: expect.stringContaining(
          'NOT NULL constraint failed: review.rating',
        ),
      })

      await expect(
        insertReview({ ...reviewMock, rating: undefined }),
      ).rejects.toEqual(notNullConstraintFailed)
      await expect(
        insertReview({ ...reviewMock, rating: null }),
      ).rejects.toEqual(notNullConstraintFailed)
    })
  })

  describe('`duration` column', () => {
    it('is a value greater than 0', async () => {
      await expect(
        insertReview({ ...reviewMock, duration: 0 }),
      ).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining('CHECK constraint failed'),
        }),
      )
      await expect(insertReview({ ...reviewMock, duration: 1 })).toResolve()
    })

    it('cannot be `null`', async () => {
      const notNullConstraintFailed = expect.objectContaining({
        message: expect.stringContaining(
          'NOT NULL constraint failed: review.duration',
        ),
      })

      await expect(
        insertReview({ ...reviewMock, duration: undefined }),
      ).rejects.toEqual(notNullConstraintFailed)
      await expect(
        insertReview({ ...reviewMock, duration: null }),
      ).rejects.toEqual(notNullConstraintFailed)
    })
  })

  describe('`created_at` column', () => {
    it('is a date', async () => {
      const now = new Date()

      await expect(
        insertReview({ ...reviewMock, createdAt: 'string' }),
      ).rejects.toThrow()
      await expect(
        insertReview({ ...reviewMock, createdAt: 0.1 }),
      ).rejects.toThrow()
      await expect(
        insertReview({ ...reviewMock, createdAt: 1 }),
      ).rejects.toThrow()
      await expect(
        insertReview({ ...reviewMock, createdAt: now }),
      ).resolves.toEqual(
        expect.objectContaining({
          createdAt: now,
        }),
      )
    })

    it('defaults to _now_', async () => {
      const { createdAt } = await insertReview(reviewMock)

      // The `created_at` datetime is determined in the database and not something that can be mocked.
      // Expect it to be within 1000 ms of when the assertion is executed.
      expect(createdAt).toBeBetween(
        new Date(new Date().valueOf() - 1000),
        new Date(),
      )
    })

    it('cannot be `null`', async () => {
      await expect(
        insertReview({ ...reviewMock, createdAt: null }),
      ).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: review.created_at',
          ),
        }),
      )
    })
  })

  describe('`created_at_offset` column', () => {
    it('is a string in the format `±HH:MM` where the `HH` value is less than 24 and the `mm` value is less than 60', async () => {
      const checkConstraintFailed = expect.objectContaining({
        message: expect.stringContaining('CHECK constraint failed'),
      })

      await expect(
        insertReview({ ...reviewMock, createdAtOffset: '+00:00' }),
      ).toResolve()
      await expect(
        insertReview({ ...reviewMock, createdAtOffset: '-00:00' }),
      ).toResolve()
      await expect(
        insertReview({ ...reviewMock, createdAtOffset: '+19:00' }),
      ).toResolve()
      await expect(
        insertReview({ ...reviewMock, createdAtOffset: '-19:00' }),
      ).toResolve()
      await expect(
        insertReview({ ...reviewMock, createdAtOffset: '+19:59' }),
      ).toResolve()
      await expect(
        insertReview({ ...reviewMock, createdAtOffset: '-19:59' }),
      ).toResolve()
      await expect(
        insertReview({ ...reviewMock, createdAtOffset: '+23:59' }),
      ).toResolve()
      await expect(
        insertReview({ ...reviewMock, createdAtOffset: '-23:59' }),
      ).toResolve()

      await expect(
        insertReview({ ...reviewMock, createdAtOffset: '+00:60' }),
      ).rejects.toEqual(checkConstraintFailed)
      await expect(
        insertReview({ ...reviewMock, createdAtOffset: '-00:60' }),
      ).rejects.toEqual(checkConstraintFailed)
      await expect(
        insertReview({ ...reviewMock, createdAtOffset: '+24:00' }),
      ).rejects.toEqual(checkConstraintFailed)
      await expect(
        insertReview({ ...reviewMock, createdAtOffset: '-24:00' }),
      ).rejects.toEqual(checkConstraintFailed)
      await expect(
        insertReview({ ...reviewMock, createdAtOffset: 'alpha' }),
      ).rejects.toEqual(checkConstraintFailed)
    })

    it('cannot be `null`', async () => {
      await expect(
        insertReview({ ...reviewMock, createdAtOffset: null }),
      ).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: review.created_at_offset',
          ),
        }),
      )
    })
  })

  describe('`is_due_fuzzed` column', () => {
    it('is a boolean', async () => {
      const insertReviewWithIsDueFuzzed = async (dueFuzzed: any) =>
        (await insertReview({ ...reviewMock, dueFuzzed })).dueFuzzed

      await expect(insertReviewWithIsDueFuzzed(true)).resolves.toBeTrue()
      await expect(insertReviewWithIsDueFuzzed(1)).resolves.toBeTrue()
      await expect(insertReviewWithIsDueFuzzed(0.1)).resolves.toBeTrue()
      await expect(insertReviewWithIsDueFuzzed('string')).resolves.toBeTrue()
      await expect(insertReviewWithIsDueFuzzed([])).resolves.toBeTrue()
      await expect(insertReviewWithIsDueFuzzed({})).resolves.toBeTrue()
      await expect(insertReviewWithIsDueFuzzed(0)).resolves.toBeFalse()
      await expect(insertReviewWithIsDueFuzzed(false)).resolves.toBeFalse()
    })

    it('cannot be `null`', async () => {
      const insertReviewWithIsDueFuzzed = async (dueFuzzed: any) =>
        (await insertReview({ ...reviewMock, dueFuzzed })).dueFuzzed

      const notNullConstraintFailed = expect.objectContaining({
        message: expect.stringContaining(
          'NOT NULL constraint failed: review.is_due_fuzzed',
        ),
      })

      await expect(insertReviewWithIsDueFuzzed(undefined)).rejects.toEqual(
        notNullConstraintFailed,
      )
      await expect(insertReviewWithIsDueFuzzed(null)).rejects.toEqual(
        notNullConstraintFailed,
      )
    })
  })

  describe('`is_learning_enabled` column', () => {
    it('is a boolean', async () => {
      const insertReviewWithIsLearningEnabled = async (learningEnabled: any) =>
        (await insertReview({ ...reviewMock, learningEnabled })).learningEnabled

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
    })

    it('cannot be `null`', async () => {
      const insertReviewWithIsLearningEnabled = async (learningEnabled: any) =>
        (await insertReview({ ...reviewMock, learningEnabled })).learningEnabled

      const notNullConstraintFailed = expect.objectContaining({
        message: expect.stringContaining(
          'NOT NULL constraint failed: review.is_learning_enabled',
        ),
      })

      await expect(
        insertReviewWithIsLearningEnabled(undefined),
      ).rejects.toEqual(notNullConstraintFailed)
      await expect(insertReviewWithIsLearningEnabled(null)).rejects.toEqual(
        notNullConstraintFailed,
      )
    })
  })

  describe('`max_interval` column', () => {
    it('is a value greater than 0', async () => {
      await expect(
        insertReview({ ...reviewMock, maxInterval: 0 }),
      ).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining('CHECK constraint failed'),
        }),
      )
      await expect(insertReview({ ...reviewMock, maxInterval: 1 })).toResolve()
    })

    it('cannot be `null`', async () => {
      const notNullConstraintFailed = expect.objectContaining({
        message: expect.stringContaining(
          'NOT NULL constraint failed: review.max_interval',
        ),
      })

      await expect(
        insertReview({ ...reviewMock, maxInterval: undefined }),
      ).rejects.toEqual(notNullConstraintFailed)
      await expect(
        insertReview({ ...reviewMock, maxInterval: null }),
      ).rejects.toEqual(notNullConstraintFailed)
    })
  })

  describe('`retention` column', () => {
    it('is a value between 0 and 100 (inclusive)', async () => {
      const checkConstraintFailed = expect.objectContaining({
        message: expect.stringContaining('CHECK constraint failed'),
      })

      await expect(
        insertReview({ ...reviewMock, retention: -1 }),
      ).rejects.toEqual(checkConstraintFailed)
      await expect(insertReview({ ...reviewMock, retention: 0 })).toResolve()
      await expect(insertReview({ ...reviewMock, retention: 100 })).toResolve()
      await expect(
        insertReview({ ...reviewMock, retention: 101 }),
      ).rejects.toEqual(checkConstraintFailed)
    })

    it('cannot be `null`', async () => {
      const notNullConstraintFailed = expect.objectContaining({
        message: expect.stringContaining(
          'NOT NULL constraint failed: review.retention',
        ),
      })

      await expect(
        insertReview({ ...reviewMock, retention: undefined }),
      ).rejects.toEqual(notNullConstraintFailed)
      await expect(
        insertReview({ ...reviewMock, retention: null }),
      ).rejects.toEqual(notNullConstraintFailed)
    })
  })

  describe('`weights` column', () => {
    /**
     * There are 19 components to the weight parameter passed to FSRS.
     *
     * @see {@link https://github.com/open-spaced-repetition/ts-fsrs/blob/65fd676414e23e21612b5344af947480f7dafa7e/src/fsrs/default.ts#L6-L10}
     */
    it('is a JSON array with at least 19 items', async () => {
      const insertReviewWithWeights = async (weights: any) =>
        await insertReview({ ...reviewMock, weights })

      const checkConstraintFailed = expect.objectContaining({
        message: expect.stringContaining('CHECK constraint failed'),
      })

      await expect(insertReviewWithWeights('string')).rejects.toEqual(
        checkConstraintFailed,
      )
      await expect(insertReviewWithWeights(1)).rejects.toEqual(
        checkConstraintFailed,
      )
      await expect(insertReviewWithWeights(0.1)).rejects.toEqual(
        checkConstraintFailed,
      )
      await expect(insertReviewWithWeights({})).rejects.toEqual(
        checkConstraintFailed,
      )
      await expect(insertReviewWithWeights([])).rejects.toEqual(
        checkConstraintFailed,
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
    })

    it('cannot be `null`', async () => {
      const insertReviewWithWeights = async (weights: any) =>
        await insertReview({ ...reviewMock, weights })

      const notNullConstraintFailed = expect.objectContaining({
        message: expect.stringContaining(
          'NOT NULL constraint failed: review.weights',
        ),
      })

      await expect(insertReviewWithWeights(undefined)).rejects.toEqual(
        notNullConstraintFailed,
      )
      await expect(insertReviewWithWeights(null)).rejects.toEqual(
        notNullConstraintFailed,
      )
    })
  })
})
