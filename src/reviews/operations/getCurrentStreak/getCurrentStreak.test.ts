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

const now = new Date()
const offset = now.getTimezoneOffset()

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
              { createdAt: sub(now, { days: 2 }) },
              { createdAt: sub(now, { days: 3 }) },
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
            reviews: [{ createdAt: now }],
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
            reviews: [{ createdAt: now }, { createdAt: now }],
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
            reviews: [{ createdAt: sub(now, { days: 1 }) }],
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
              { createdAt: sub(now, { days: 1 }) },
              { createdAt: sub(now, { days: 1 }) },
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
            reviews: [{ createdAt: now }, { createdAt: sub(now, { days: 1 }) }],
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
              { createdAt: sub(now, { days: 1 }) },
              { createdAt: sub(now, { days: 2 }) },
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
              { createdAt: now },
              { createdAt: sub(now, { days: 1 }) },
              { createdAt: sub(now, { days: 3 }) },
              { createdAt: sub(now, { days: 4 }) },
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
              { createdAt: sub(now, { days: 1 }) },
              { createdAt: sub(now, { days: 2 }) },
              { createdAt: sub(now, { days: 4 }) },
              { createdAt: sub(now, { days: 5 }) },
            ],
          },
        ],
      },
      expected: 2,
    },
    {
      name: 'when reviews are completed in consecutive localized days across timezones and the last review was completed today, returns the number of localized days reviews have been consecutively completed from today',
      fixture: {
        notes: [{ id: 1, collections: [1] }],
        reviewables: [
          {
            id: 1,
            note: 1,
            reviews: [
              { createdAt: now },
              {
                /**
                 * Subtract approximately 2 days from now and add an offset of approximately 1 day.
                 * This means, in UTC, there is a gap of approximately 2 days from the next review;
                 * but, when the dates are localized, it appears to be 1 day.
                 */
                createdAt: sub(now, {
                  days: 2,
                  minutes: offset, // This accounts for the timezone of the system running the test
                }),
                createdAtOffset: '+23:59',
              },
            ],
          },
        ],
      },
      expected: 2,
    },
    {
      name: 'when reviews are completed in consecutive localized days across timezones and the last review was completed yesterday, returns the number of localized days reviews have been consecutively completed from yesterday',
      fixture: {
        notes: [{ id: 1, collections: [1] }],
        reviewables: [
          {
            id: 1,
            note: 1,
            reviews: [
              { createdAt: sub(now, { days: 1 }) },
              {
                /**
                 * Subtract approximately 3 days from now and add an offset of approximately 1 day.
                 * This means, in UTC, there is a gap of approximately 2 days from the next review;
                 * but, when the dates are localized, it appears to be 1 day.
                 */
                createdAt: sub(now, {
                  days: 3,
                  minutes: offset, // This accounts for the timezone of the system running the test
                }),
                createdAtOffset: '+23:59',
              },
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
