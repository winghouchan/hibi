import { note } from '@/notes/schema'
import { mockDatabase } from 'test/utils'
import { review } from './review'
import { reviewable } from './reviewable'
import {
  ReviewableSnapshot,
  ReviewableSnapshotParameters,
  reviewableSnapshot,
} from './reviewableSnapshot'

type DatabaseMock = Awaited<ReturnType<typeof mockDatabase>>
type Any<Type> = {
  [Property in keyof Type]: any
}

describe('`reviewable_snapshot` table', () => {
  let database: DatabaseMock['database'],
    resetDatabaseMock: DatabaseMock['resetDatabaseMock'],
    reviewableSnapshotMock: Pick<
      ReviewableSnapshot,
      'difficulty' | 'due' | 'review' | 'reviewable' | 'stability' | 'state'
    >,
    insertReviewableSnapshot: (
      values: Any<ReviewableSnapshotParameters>,
    ) => Promise<ReviewableSnapshot>

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
    const [{ reviewId }] = await database
      .insert(review)
      .values({
        dueFuzzed: false,
        learningEnabled: true,
        maxInterval: 36500,
        retention: 90,
        weights: [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
        ],
        rating: 1,
        duration: 1000,
        reviewable: reviewableId,
      })
      .returning({ reviewId: review.id })

    reviewableSnapshotMock = {
      review: reviewId,
      reviewable: reviewableId,
      difficulty: 1,
      due: new Date(),
      stability: 1,
      state: 1,
    }

    insertReviewableSnapshot = async (values) =>
      (await database.insert(reviewableSnapshot).values(values).returning())[0]
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
        insertReviewableSnapshot({ ...reviewableSnapshotMock, id: 'string' }),
      ).rejects.toEqual(datatypeMismatch)
      await expect(
        insertReviewableSnapshot({ ...reviewableSnapshotMock, id: 0.1 }),
      ).rejects.toEqual(datatypeMismatch)
      await expect(
        insertReviewableSnapshot({ ...reviewableSnapshotMock, id: 1 }),
      ).resolves.toEqual(
        expect.objectContaining({
          id: expect.any(Number),
        }),
      )
    })

    it('cannot be `null`', async () => {
      await expect(
        insertReviewableSnapshot({ ...reviewableSnapshotMock, id: undefined }),
      ).resolves.toEqual(expect.objectContaining({ id: expect.any(Number) }))
      await expect(
        insertReviewableSnapshot({ ...reviewableSnapshotMock, id: null }),
      ).resolves.toEqual(expect.objectContaining({ id: expect.any(Number) }))
    })

    it('auto-increments', async () => {
      const output = [
        await insertReviewableSnapshot(reviewableSnapshotMock),
        await insertReviewableSnapshot(reviewableSnapshotMock),
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
        insertReviewableSnapshot({ ...reviewableSnapshotMock, reviewable: 0 }),
      ).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining('FOREIGN KEY constraint failed'),
        }),
      )
    })

    it('cannot be `null`', async () => {
      const notNullConstraintFailed = expect.objectContaining({
        message: expect.stringContaining(
          'NOT NULL constraint failed: reviewable_snapshot.reviewable',
        ),
      })

      await expect(
        insertReviewableSnapshot({
          ...reviewableSnapshotMock,
          reviewable: undefined,
        }),
      ).rejects.toEqual(notNullConstraintFailed)
      await expect(
        insertReviewableSnapshot({
          ...reviewableSnapshotMock,
          reviewable: null,
        }),
      ).rejects.toEqual(notNullConstraintFailed)
    })
  })

  describe('`review` column', () => {
    it('must reference a review', async () => {
      await expect(
        insertReviewableSnapshot({ ...reviewableSnapshotMock, review: 0 }),
      ).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining('FOREIGN KEY constraint failed'),
        }),
      )
    })

    it('cannot be `null`', async () => {
      const notNullConstraintFailed = expect.objectContaining({
        message: expect.stringContaining(
          'NOT NULL constraint failed: reviewable_snapshot.review',
        ),
      })

      await expect(
        insertReviewableSnapshot({
          ...reviewableSnapshotMock,
          review: undefined,
        }),
      ).rejects.toEqual(notNullConstraintFailed)
      await expect(
        insertReviewableSnapshot({
          ...reviewableSnapshotMock,
          review: null,
        }),
      ).rejects.toEqual(notNullConstraintFailed)
    })
  })

  describe('`difficulty` column', () => {
    it('is a value greater than 0', async () => {
      await expect(
        insertReviewableSnapshot({ ...reviewableSnapshotMock, difficulty: 0 }),
      ).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining('CHECK constraint failed'),
        }),
      )
      await expect(
        insertReviewableSnapshot({ ...reviewableSnapshotMock, difficulty: 1 }),
      ).toResolve()
    })

    it('cannot be `null`', async () => {
      const notNullConstraintFailed = expect.objectContaining({
        message: expect.stringContaining(
          'NOT NULL constraint failed: reviewable_snapshot.difficulty',
        ),
      })

      await expect(
        insertReviewableSnapshot({
          ...reviewableSnapshotMock,
          difficulty: undefined,
        }),
      ).rejects.toEqual(notNullConstraintFailed)
      await expect(
        insertReviewableSnapshot({
          ...reviewableSnapshotMock,
          difficulty: null,
        }),
      ).rejects.toEqual(notNullConstraintFailed)
    })
  })

  describe('`due` column', () => {
    it('is a date', async () => {
      const now = new Date()

      await expect(
        insertReviewableSnapshot({
          ...reviewableSnapshotMock,
          due: 'string',
        }),
      ).rejects.toThrow()
      await expect(
        insertReviewableSnapshot({
          ...reviewableSnapshotMock,
          due: 0.1,
        }),
      ).rejects.toThrow()
      await expect(
        insertReviewableSnapshot({ ...reviewableSnapshotMock, due: 1 }),
      ).rejects.toThrow()
      await expect(
        insertReviewableSnapshot({
          ...reviewableSnapshotMock,
          due: now,
        }),
      ).resolves.toEqual(
        expect.objectContaining({
          due: now,
        }),
      )
    })

    it('cannot be `null`', async () => {
      const notNullConstraintFailed = expect.objectContaining({
        message: expect.stringContaining(
          'NOT NULL constraint failed: reviewable_snapshot.due',
        ),
      })

      await expect(
        insertReviewableSnapshot({
          ...reviewableSnapshotMock,
          due: undefined,
        }),
      ).rejects.toEqual(notNullConstraintFailed)
      await expect(
        insertReviewableSnapshot({
          ...reviewableSnapshotMock,
          due: null,
        }),
      ).rejects.toEqual(notNullConstraintFailed)
    })
  })

  describe('`stability` column', () => {
    it('is a value greater than 0', async () => {
      await expect(
        insertReviewableSnapshot({ ...reviewableSnapshotMock, stability: 0 }),
      ).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining('CHECK constraint failed'),
        }),
      )
      await expect(
        insertReviewableSnapshot({ ...reviewableSnapshotMock, stability: 1 }),
      ).toResolve()
    })

    it('cannot be `null`', async () => {
      const notNullConstraintFailed = expect.objectContaining({
        message: expect.stringContaining(
          'NOT NULL constraint failed: reviewable_snapshot.stability',
        ),
      })

      await expect(
        insertReviewableSnapshot({
          ...reviewableSnapshotMock,
          stability: undefined,
        }),
      ).rejects.toEqual(notNullConstraintFailed)
      await expect(
        insertReviewableSnapshot({
          ...reviewableSnapshotMock,
          stability: null,
        }),
      ).rejects.toEqual(notNullConstraintFailed)
    })
  })

  describe('`state` column', () => {
    it('is a valid state', async () => {
      const insertReviewableSnapshotWithState = async (state: number) =>
        await insertReviewableSnapshot({ ...reviewableSnapshotMock, state })

      const checkConstraintFailed = expect.objectContaining({
        message: expect.stringContaining('CHECK constraint failed'),
      })

      await expect(insertReviewableSnapshotWithState(-1)).rejects.toEqual(
        checkConstraintFailed,
      )
      await expect(insertReviewableSnapshotWithState(0)).toResolve()
      await expect(insertReviewableSnapshotWithState(1)).toResolve()
      await expect(insertReviewableSnapshotWithState(2)).toResolve()
      await expect(insertReviewableSnapshotWithState(3)).toResolve()
      await expect(insertReviewableSnapshotWithState(4)).rejects.toEqual(
        checkConstraintFailed,
      )
    })

    it('cannot be `null`', async () => {
      const insertReviewableSnapshotWithState = async (state: any) =>
        await insertReviewableSnapshot({ ...reviewableSnapshotMock, state })

      const notNullConstraintFailed = expect.objectContaining({
        message: expect.stringContaining(
          'NOT NULL constraint failed: reviewable_snapshot.state',
        ),
      })

      await expect(
        insertReviewableSnapshotWithState(undefined),
      ).rejects.toEqual(notNullConstraintFailed)
      await expect(insertReviewableSnapshotWithState(null)).rejects.toEqual(
        notNullConstraintFailed,
      )
    })
  })

  describe('`created_at` column', () => {
    it('is a date', async () => {
      const now = new Date()

      await expect(
        insertReviewableSnapshot({
          ...reviewableSnapshotMock,
          createdAt: 'string',
        }),
      ).rejects.toThrow()
      await expect(
        insertReviewableSnapshot({
          ...reviewableSnapshotMock,
          createdAt: 0.1,
        }),
      ).rejects.toThrow()
      await expect(
        insertReviewableSnapshot({ ...reviewableSnapshotMock, createdAt: 1 }),
      ).rejects.toThrow()
      await expect(
        insertReviewableSnapshot({
          ...reviewableSnapshotMock,
          createdAt: now,
        }),
      ).resolves.toEqual(
        expect.objectContaining({
          createdAt: now,
        }),
      )
    })

    it('defaults to _now_', async () => {
      const { createdAt } = await insertReviewableSnapshot(
        reviewableSnapshotMock,
      )

      // The `created_at` datetime is determined in the database and not something that can be mocked.
      // Expect it to be within 1000 ms of when the assertion is executed.
      expect(createdAt).toBeBetween(
        new Date(new Date().valueOf() - 1000),
        new Date(),
      )
    })

    it('cannot be `null`', async () => {
      await expect(
        insertReviewableSnapshot({
          ...reviewableSnapshotMock,
          createdAt: null,
        }),
      ).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'NOT NULL constraint failed: reviewable_snapshot.created_at',
          ),
        }),
      )
    })
  })
})
