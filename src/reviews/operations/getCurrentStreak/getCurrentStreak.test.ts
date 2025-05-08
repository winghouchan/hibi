import { sub } from 'date-fns'
import { random } from 'lodash'
import { note } from '@/notes/schema'
import { mockDatabase } from 'test/utils'
import { review, reviewable } from '../../schema'

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

describe('getCurrentStreak', () => {
  test.each([
    {
      name: 'when no reviews have been completed, returns 0',
      fixture: {
        notes: [{ id: 1, collections: [1] }],
        reviewables: [
          {
            id: 1,
            note: 1,
            reviews: [],
          },
        ],
      },
      expected: 0,
    },
    {
      name: 'when reviews have been completed before today and yesterday, returns 0',
      fixture: {
        notes: [{ id: 1, collections: [1] }],
        reviewables: [
          {
            id: 1,
            note: 1,
            reviews: [
              { createdAt: sub(new Date(), { days: 2 }) },
              { createdAt: sub(new Date(), { days: 3 }) },
            ],
          },
        ],
      },
      expected: 0,
    },
    {
      name: 'when 1 review has been completed today and no reviews completed yesterday, returns 1',
      fixture: {
        notes: [{ id: 1, collections: [1] }],
        reviewables: [
          {
            id: 1,
            note: 1,
            reviews: [{ createdAt: new Date() }],
          },
        ],
      },
      expected: 1,
    },
    {
      name: 'when multiple reviews have been completed today and no reviews completed yesterday, returns 1',
      fixture: {
        notes: [{ id: 1, collections: [1] }],
        reviewables: [
          {
            id: 1,
            note: 1,
            reviews: [{ createdAt: new Date() }, { createdAt: new Date() }],
          },
        ],
      },
      expected: 1,
    },
    {
      name: 'when 1 review has been completed yesterday and no reviews completed before yesterday, returns 1',
      fixture: {
        notes: [{ id: 1, collections: [1] }],
        reviewables: [
          {
            id: 1,
            note: 1,
            reviews: [{ createdAt: sub(new Date(), { days: 1 }) }],
          },
        ],
      },
      expected: 1,
    },
    {
      name: 'when multiple reviews have been completed yesterday and no reviews completed before yesterday, returns 1',
      fixture: {
        notes: [{ id: 1, collections: [1] }],
        reviewables: [
          {
            id: 1,
            note: 1,
            reviews: [
              { createdAt: sub(new Date(), { days: 1 }) },
              { createdAt: sub(new Date(), { days: 1 }) },
            ],
          },
        ],
      },
      expected: 1,
    },
    {
      name: 'when more than 1 reviews have been completed across consecutive days and the last review was completed today, returns the number of days reviews have been consecutively completed',
      fixture: {
        notes: [{ id: 1, collections: [1] }],
        reviewables: [
          {
            id: 1,
            note: 1,
            reviews: [
              { createdAt: new Date() },
              { createdAt: sub(new Date(), { days: 1 }) },
            ],
          },
        ],
      },
      expected: 2,
    },
    {
      name: 'when more than 1 reviews have been completed across consecutive days and the last review was completed yesterday, returns the number of days reviews have been consecutively completed',
      fixture: {
        notes: [{ id: 1, collections: [1] }],
        reviewables: [
          {
            id: 1,
            note: 1,
            reviews: [
              { createdAt: sub(new Date(), { days: 1 }) },
              { createdAt: sub(new Date(), { days: 2 }) },
            ],
          },
        ],
      },
      expected: 2,
    },
    {
      name: 'when there is a gap in the reviews and the last review was completed today, returns the number of days reviews have been consecutively completed from today',
      fixture: {
        notes: [{ id: 1, collections: [1] }],
        reviewables: [
          {
            id: 1,
            note: 1,
            reviews: [
              { createdAt: new Date() },
              { createdAt: sub(new Date(), { days: 1 }) },
              { createdAt: sub(new Date(), { days: 3 }) },
              { createdAt: sub(new Date(), { days: 4 }) },
            ],
          },
        ],
      },
      expected: 2,
    },
    {
      name: 'when there is a gap in the reviews and the last review was completed yesterday, returns the number of days reviews have been consecutively completed from yesterday',
      fixture: {
        notes: [{ id: 1, collections: [1] }],
        reviewables: [
          {
            id: 1,
            note: 1,
            reviews: [
              { createdAt: sub(new Date(), { days: 1 }) },
              { createdAt: sub(new Date(), { days: 2 }) },
              { createdAt: sub(new Date(), { days: 4 }) },
              { createdAt: sub(new Date(), { days: 5 }) },
            ],
          },
        ],
      },
      expected: 2,
    },
  ])('$name', async ({ fixture, expected }) => {
    const { database, resetDatabaseMock } = await mockDatabase()
    const { default: getCurrentStreak } = await import('./getCurrentStreak')

    await database.insert(note).values(fixture.notes)
    await database
      .insert(reviewable)
      .values(
        fixture.reviewables.map(({ reviews, ...reviewable }) => reviewable),
      )

    const reviews = fixture.reviewables.flatMap(({ id: reviewable, reviews }) =>
      reviews.map((review) => ({ reviewable, ...review, ...mockReview() })),
    )

    if (reviews.length > 0) {
      await database.insert(review).values(reviews)
    }

    const output = await getCurrentStreak()

    expect(output).toEqual(expected)

    resetDatabaseMock()
  })
})
