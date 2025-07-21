import { sub } from 'date-fns'
import { random } from 'lodash'
import { note } from '@/notes/schema'
import { review, reviewable } from '@/reviews/schema'
import { mockDatabase } from 'test/utils'

function mockReview() {
  return {
    dueFuzzed: false,
    duration: random(1000, 10000),
    learningEnabled: false,
    maxInterval: 100,
    rating: 1,
    retention: 0.8 * 100,
    weights: Array.from({ length: 19 }, () => 0),
  }
}

const now = new Date()

describe('getReviewCount', () => {
  test.each([
    {
      name: 'when there are 0 reviews, returns 0',
      fixture: {
        reviews: [],
      },
      expected: 0,
    },
    {
      name: 'when there are more than 0 reviews, returns the number of reviews',
      fixture: {
        reviews: [{ createdAt: now }],
      },
      expected: 1,
    },
    {
      name: 'when the `from` filter is specified, returns the number of reviews completed after and including the `from` date',
      fixture: {
        reviews: [
          { createdAt: sub(now, { days: 2 }) },
          { createdAt: sub(now, { days: 1 }) },
          { createdAt: now },
        ],
      },
      input: {
        from: sub(now, { days: 1 }),
      },
      expected: 2,
    },
    {
      name: 'when the `to` filter is specified, returns the number of reviews completed before and excluding the `to` date',
      fixture: {
        reviews: [
          { createdAt: sub(now, { days: 2 }) },
          { createdAt: sub(now, { days: 1, seconds: 1 }) },
          { createdAt: sub(now, { days: 1 }) },
          { createdAt: now },
        ],
      },
      input: {
        to: sub(now, { days: 1 }),
      },
      expected: 2,
    },
    {
      name: 'when the `from` and `to` filters are specified, returns the number of reviews completed after and including the `from` date and before and excluding the `to` date',
      fixture: {
        reviews: [
          { createdAt: sub(now, { days: 3 }) },
          { createdAt: sub(now, { days: 2 }) },
          { createdAt: sub(now, { days: 1, seconds: 1 }) },
          { createdAt: sub(now, { days: 1 }) },
          { createdAt: now },
        ],
      },
      input: {
        from: sub(now, { days: 2 }),
        to: sub(now, { days: 1 }),
      },
      expected: 2,
    },
  ])('$name', async ({ expected, fixture, input }) => {
    const { database, resetDatabaseMock } = await mockDatabase()
    const { default: getReviewCount } = await import('./getReviewCount')

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

    const output = await getReviewCount(input)

    expect(output).toEqual(expected)

    resetDatabaseMock()
  })
})
