import { sub } from 'date-fns'
import { note } from '@/notes/schema'
import { review, reviewable } from '@/reviews/schema'
import { mockDatabase } from 'test/utils'

function mockReview() {
  return {
    dueFuzzed: false,
    learningEnabled: false,
    maxInterval: 100,
    rating: 1,
    retention: 0.8 * 100,
    weights: Array.from({ length: 19 }, () => 0),
  }
}

const now = new Date()

describe('getReviewTime', () => {
  test.each([
    {
      name: 'when there are 0 reviews, should return 0',
      fixture: {
        reviews: [],
      },
      expected: 0,
    },
    {
      name: 'when there is more than 0 reviews, should return the cumulative review time',
      fixture: {
        reviews: [
          { createdAt: now, duration: 1000 },
          { createdAt: now, duration: 1000 },
        ],
      },
      expected: 2000,
    },
    {
      name: 'when the `from` filter is specified, returns the cumulative review time of reviews completed after and including the `from` date',
      fixture: {
        reviews: [
          { createdAt: sub(now, { days: 2 }), duration: 1000 },
          { createdAt: sub(now, { days: 1 }), duration: 2000 },
          { createdAt: now, duration: 3000 },
        ],
      },
      input: {
        from: sub(now, { days: 1 }),
      },
      expected: 5000,
    },
    {
      name: 'when the `to` filter is specified, returns the cumulative review time of reviews completed before and excluding the `to` date',
      fixture: {
        reviews: [
          { createdAt: sub(now, { days: 2 }), duration: 1000 },
          {
            createdAt: sub(now, { days: 1, seconds: 1 }),
            duration: 2000,
          },
          { createdAt: sub(now, { days: 1 }), duration: 3000 },
          { createdAt: now, duration: 4000 },
        ],
      },
      input: {
        to: sub(now, { days: 1 }),
      },
      expected: 3000,
    },
    {
      name: 'when the `from` and `to` filters are specified, returns the cumulative review time of reviews completed after and including the `from` date and before and excluding the `to` date',
      fixture: {
        reviews: [
          { createdAt: sub(now, { days: 3 }), duration: 1000 },
          { createdAt: sub(now, { days: 2 }), duration: 2000 },
          {
            createdAt: sub(now, { days: 1, seconds: 1 }),
            duration: 3000,
          },
          { createdAt: sub(now, { days: 1 }), duration: 4000 },
          { createdAt: now, duration: 5000 },
        ],
      },
      input: {
        from: sub(now, { days: 2 }),
        to: sub(now, { days: 1 }),
      },
      expected: 5000,
    },
  ])('$name', async ({ expected, fixture, input }) => {
    const { database, resetDatabaseMock } = await mockDatabase()
    const { default: getReviewTime } = await import('./getReviewTime')

    const [{ id: noteId }] = await database.insert(note).values({}).returning()
    const [{ id: reviewableId }] = await database
      .insert(reviewable)
      .values({ note: noteId })
      .returning()

    if (fixture.reviews.length > 0) {
      await database.insert(review).values(
        fixture.reviews.map((review) => ({
          reviewable: reviewableId,
          ...mockReview(),
          ...review,
        })),
      )
    }

    const output = await getReviewTime(input)

    expect(output).toEqual(expected)

    resetDatabaseMock()
  })
})
