import { note } from '@/notes/schema'
import { mockDatabase } from '@/test/utils'
import { review } from './review'
import { reviewable } from './reviewable'
import { reviewableSnapshot } from './reviewableSnapshot'

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
const REVIEWABLE_SNAPSHOT_MOCK = {
  difficulty: 1,
  due: new Date(),
  stability: 1,
  state: 1,
}

describe('`reviewable_snapshot` table', () => {
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
      const [{ reviewId }] = await database
        .insert(review)
        .values({
          ...DEFAULT_SCHEDULER_PARAMETERS_MOCK,
          ...REVIEW_INPUTS_MOCK,
          reviewable: reviewableId,
        })
        .returning({ reviewId: review.id })
      const insertReviewableSnapshot = async ({ id }: { id: any }) =>
        (
          await database
            .insert(reviewableSnapshot)
            .values({
              ...REVIEWABLE_SNAPSHOT_MOCK,
              reviewable: reviewableId,
              review: reviewId,
              id,
            })
            .returning({ id: reviewableSnapshot.id })
        )[0]

      await expect(() =>
        insertReviewableSnapshot({ id: 'string' }),
      ).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining('datatype mismatch'),
        }),
      )
      await expect(() => insertReviewableSnapshot({ id: 0.1 })).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining('datatype mismatch'),
        }),
      )
      await expect(insertReviewableSnapshot({ id: 1 })).resolves.toEqual({
        id: 1,
      })

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
      const [{ reviewId }] = await database
        .insert(review)
        .values({
          ...DEFAULT_SCHEDULER_PARAMETERS_MOCK,
          ...REVIEW_INPUTS_MOCK,
          reviewable: reviewableId,
        })
        .returning({ reviewId: review.id })
      const insertReviewableSnapshotWithNullId = async () =>
        (
          await database
            .insert(reviewableSnapshot)
            .values({
              ...REVIEWABLE_SNAPSHOT_MOCK,
              reviewable: reviewableId,
              review: reviewId,
              // Cast `null` to `number` so that compile time checks pass and run time checks can be tested
              id: null as unknown as number,
            })
            .returning({ id: reviewableSnapshot.id })
        )[0]

      const output = await insertReviewableSnapshotWithNullId()

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
      const [{ reviewId }] = await database
        .insert(review)
        .values({
          ...DEFAULT_SCHEDULER_PARAMETERS_MOCK,
          ...REVIEW_INPUTS_MOCK,
          reviewable: reviewableId,
        })
        .returning({ reviewId: review.id })
      const insertReviewableSnapshot = async () =>
        (
          await database
            .insert(reviewableSnapshot)
            .values({
              ...REVIEWABLE_SNAPSHOT_MOCK,
              reviewable: reviewableId,
              review: reviewId,
            })
            .returning({ id: reviewableSnapshot.id })
        )[0]

      const output = [
        await insertReviewableSnapshot(),
        await insertReviewableSnapshot(),
      ]

      expect(output).toEqual([{ id: 1 }, { id: 2 }])

      resetDatabaseMock()
    })
  })

  describe('`reviewable` column', () => {
    it('must reference a reviewable', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      const [{ reviewableId }] = await database
        .insert(reviewable)
        .values({ note: noteId })
        .returning({ reviewableId: reviewable.id })
      const [{ reviewId }] = await database
        .insert(review)
        .values({
          ...DEFAULT_SCHEDULER_PARAMETERS_MOCK,
          ...REVIEW_INPUTS_MOCK,
          reviewable: reviewableId,
        })
        .returning({ reviewId: review.id })
      const insertReviewableSnapshot = async () =>
        await database.insert(reviewableSnapshot).values({
          ...REVIEWABLE_SNAPSHOT_MOCK,
          reviewable: 0,
          review: reviewId,
        })

      await expect(insertReviewableSnapshot).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining('FOREIGN KEY constraint failed'),
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
      const [{ reviewId }] = await database
        .insert(review)
        .values({
          ...DEFAULT_SCHEDULER_PARAMETERS_MOCK,
          ...REVIEW_INPUTS_MOCK,
          reviewable: reviewableId,
        })
        .returning({ reviewId: review.id })
      const insertReviewableSnapshot = async () =>
        await database.insert(reviewableSnapshot).values({
          ...REVIEWABLE_SNAPSHOT_MOCK,
          // Cast `null` to `number` so that compile time checks pass and run time checks can be tested
          reviewable: null as unknown as number,
          review: reviewId,
        })

      await expect(insertReviewableSnapshot).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: reviewable_snapshot.reviewable',
          ),
        }),
      )

      resetDatabaseMock()
    })
  })

  describe('`review` column', () => {
    it('must reference a review', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      const [{ reviewableId }] = await database
        .insert(reviewable)
        .values({ note: noteId })
        .returning({ reviewableId: reviewable.id })
      const insertReviewableSnapshot = async () =>
        await database.insert(reviewableSnapshot).values({
          ...REVIEWABLE_SNAPSHOT_MOCK,
          reviewable: reviewableId,
          review: 0,
        })

      await expect(insertReviewableSnapshot).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining('FOREIGN KEY constraint failed'),
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
      const insertReviewableSnapshot = async () =>
        await database.insert(reviewableSnapshot).values({
          ...REVIEWABLE_SNAPSHOT_MOCK,
          reviewable: reviewableId,
          // Cast `null` to `number` so that compile time checks pass and run time checks can be tested
          review: null as unknown as number,
        })

      await expect(insertReviewableSnapshot).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: reviewable_snapshot.review',
          ),
        }),
      )

      resetDatabaseMock()
    })
  })

  describe('`difficulty` column', () => {
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
      const [{ reviewId }] = await database
        .insert(review)
        .values({
          ...DEFAULT_SCHEDULER_PARAMETERS_MOCK,
          ...REVIEW_INPUTS_MOCK,
          reviewable: reviewableId,
        })
        .returning({ reviewId: review.id })
      const insertReviewableSnapshotWithDifficulty = async (
        difficulty: number,
      ) =>
        await database.insert(reviewableSnapshot).values({
          ...REVIEWABLE_SNAPSHOT_MOCK,
          reviewable: reviewableId,
          review: reviewId,
          difficulty,
        })

      await expect(insertReviewableSnapshotWithDifficulty(0)).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'CHECK constraint failed: difficulty',
          ),
        }),
      )
      await expect(insertReviewableSnapshotWithDifficulty(1)).toResolve()

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
      const [{ reviewId }] = await database
        .insert(review)
        .values({
          ...DEFAULT_SCHEDULER_PARAMETERS_MOCK,
          ...REVIEW_INPUTS_MOCK,
          reviewable: reviewableId,
        })
        .returning({ reviewId: review.id })
      const insertReviewableSnapshotWithDifficulty = async (difficulty: any) =>
        await database.insert(reviewableSnapshot).values({
          ...REVIEWABLE_SNAPSHOT_MOCK,
          reviewable: reviewableId,
          review: reviewId,
          difficulty,
        })

      await expect(
        insertReviewableSnapshotWithDifficulty(undefined),
      ).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: reviewable_snapshot.difficulty',
          ),
        }),
      )
      await expect(
        insertReviewableSnapshotWithDifficulty(null),
      ).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: reviewable_snapshot.difficulty',
          ),
        }),
      )

      resetDatabaseMock()
    })
  })

  describe('`due` column', () => {
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
      const [{ reviewId }] = await database
        .insert(review)
        .values({
          ...DEFAULT_SCHEDULER_PARAMETERS_MOCK,
          ...REVIEW_INPUTS_MOCK,
          reviewable: reviewableId,
        })
        .returning({ reviewId: review.id })
      const insertReviewableSnapshot = async ({
        created_at,
      }: {
        created_at: any
      }) =>
        (
          await database
            .insert(reviewableSnapshot)
            .values({
              ...REVIEWABLE_SNAPSHOT_MOCK,
              reviewable: reviewableId,
              review: reviewId,
              created_at,
            })
            .returning({ createdAt: reviewableSnapshot.created_at })
        )[0]
      const now = new Date()

      await expect(() =>
        insertReviewableSnapshot({ created_at: 'string' }),
      ).rejects.toThrow()
      await expect(() =>
        insertReviewableSnapshot({ created_at: 0.1 }),
      ).rejects.toThrow()
      await expect(() =>
        insertReviewableSnapshot({ created_at: 1 }),
      ).rejects.toThrow()
      await expect(
        insertReviewableSnapshot({ created_at: now }),
      ).resolves.toEqual({
        createdAt: now,
      })

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
      const [{ reviewId }] = await database
        .insert(review)
        .values({
          ...DEFAULT_SCHEDULER_PARAMETERS_MOCK,
          ...REVIEW_INPUTS_MOCK,
          reviewable: reviewableId,
        })
        .returning({ reviewId: review.id })
      const insertReviewableSnapshotWithNullCreatedAt = async () =>
        await database.insert(reviewableSnapshot).values({
          ...REVIEWABLE_SNAPSHOT_MOCK,
          reviewable: reviewableId,
          review: reviewId,
          // Cast `null` to `Date` so that compile time checks pass and run time checks can be tested
          created_at: null as unknown as Date,
        })

      await expect(insertReviewableSnapshotWithNullCreatedAt).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: reviewable_snapshot.created_at',
          ),
        }),
      )

      resetDatabaseMock()
    })
  })

  describe('`stability` column', () => {
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
      const [{ reviewId }] = await database
        .insert(review)
        .values({
          ...DEFAULT_SCHEDULER_PARAMETERS_MOCK,
          ...REVIEW_INPUTS_MOCK,
          reviewable: reviewableId,
        })
        .returning({ reviewId: review.id })
      const insertReviewableSnapshotWithStability = async (stability: number) =>
        await database.insert(reviewableSnapshot).values({
          ...REVIEWABLE_SNAPSHOT_MOCK,
          reviewable: reviewableId,
          review: reviewId,
          stability,
        })

      await expect(() =>
        insertReviewableSnapshotWithStability(0),
      ).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'CHECK constraint failed: stability',
          ),
        }),
      )
      await expect(insertReviewableSnapshotWithStability(1)).toResolve()

      resetDatabaseMock()
    })
  })

  describe('`state` column', () => {
    it('is a valid state', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const [{ noteId }] = await database
        .insert(note)
        .values({})
        .returning({ noteId: note.id })
      const [{ reviewableId }] = await database
        .insert(reviewable)
        .values({ note: noteId })
        .returning({ reviewableId: reviewable.id })
      const [{ reviewId }] = await database
        .insert(review)
        .values({
          ...DEFAULT_SCHEDULER_PARAMETERS_MOCK,
          ...REVIEW_INPUTS_MOCK,
          reviewable: reviewableId,
        })
        .returning({ reviewId: review.id })
      const insertReviewableSnapshotWithState = async (state: number) =>
        await database.insert(reviewableSnapshot).values({
          ...REVIEWABLE_SNAPSHOT_MOCK,
          reviewable: reviewableId,
          review: reviewId,
          state,
        })

      await expect(insertReviewableSnapshotWithState(-1)).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining('CHECK constraint failed: state'),
        }),
      )
      await expect(insertReviewableSnapshotWithState(0)).toResolve()
      await expect(insertReviewableSnapshotWithState(1)).toResolve()
      await expect(insertReviewableSnapshotWithState(2)).toResolve()
      await expect(insertReviewableSnapshotWithState(3)).toResolve()
      await expect(insertReviewableSnapshotWithState(4)).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining('CHECK constraint failed: state'),
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
      const [{ reviewId }] = await database
        .insert(review)
        .values({
          ...DEFAULT_SCHEDULER_PARAMETERS_MOCK,
          ...REVIEW_INPUTS_MOCK,
          reviewable: reviewableId,
        })
        .returning({ reviewId: review.id })
      const insertReviewableSnapshotWithState = async (state: any) =>
        await database.insert(reviewableSnapshot).values({
          ...REVIEWABLE_SNAPSHOT_MOCK,
          reviewable: reviewableId,
          review: reviewId,
          state,
        })

      await expect(
        insertReviewableSnapshotWithState(undefined),
      ).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: reviewable_snapshot.state',
          ),
        }),
      )
      await expect(insertReviewableSnapshotWithState(null)).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: reviewable_snapshot.state',
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
      const [{ reviewId }] = await database
        .insert(review)
        .values({
          ...DEFAULT_SCHEDULER_PARAMETERS_MOCK,
          ...REVIEW_INPUTS_MOCK,
          reviewable: reviewableId,
        })
        .returning({ reviewId: review.id })
      const insertReviewableSnapshot = async ({
        created_at,
      }: {
        created_at: any
      }) =>
        (
          await database
            .insert(reviewableSnapshot)
            .values({
              ...REVIEWABLE_SNAPSHOT_MOCK,
              reviewable: reviewableId,
              review: reviewId,
              created_at,
            })
            .returning({ createdAt: reviewableSnapshot.created_at })
        )[0]
      const now = new Date()

      await expect(() =>
        insertReviewableSnapshot({ created_at: 'string' }),
      ).rejects.toThrow()
      await expect(() =>
        insertReviewableSnapshot({ created_at: 0.1 }),
      ).rejects.toThrow()
      await expect(() =>
        insertReviewableSnapshot({ created_at: 1 }),
      ).rejects.toThrow()
      await expect(
        insertReviewableSnapshot({ created_at: now }),
      ).resolves.toEqual({
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
      const [{ reviewId }] = await database
        .insert(review)
        .values({
          ...DEFAULT_SCHEDULER_PARAMETERS_MOCK,
          ...REVIEW_INPUTS_MOCK,
          reviewable: reviewableId,
        })
        .returning({ reviewId: review.id })
      const insertReviewableSnapshot = async () =>
        (
          await database
            .insert(reviewableSnapshot)
            .values({
              ...REVIEWABLE_SNAPSHOT_MOCK,
              reviewable: reviewableId,
              review: reviewId,
            })
            .returning({ createdAt: reviewableSnapshot.created_at })
        )[0]

      const { createdAt } = await insertReviewableSnapshot()

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
      const [{ reviewId }] = await database
        .insert(review)
        .values({
          ...DEFAULT_SCHEDULER_PARAMETERS_MOCK,
          ...REVIEW_INPUTS_MOCK,
          reviewable: reviewableId,
        })
        .returning({ reviewId: review.id })
      const insertReviewableSnapshotWithNullCreatedAt = async () =>
        await database.insert(reviewableSnapshot).values({
          ...REVIEWABLE_SNAPSHOT_MOCK,
          reviewable: reviewableId,
          review: reviewId,
          // Cast `null` to `Date` so that compile time checks pass and run time checks can be tested
          created_at: null as unknown as Date,
        })

      await expect(insertReviewableSnapshotWithNullCreatedAt).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: reviewable_snapshot.created_at',
          ),
        }),
      )

      resetDatabaseMock()
    })
  })
})
