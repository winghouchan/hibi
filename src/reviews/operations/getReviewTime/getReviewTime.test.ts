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
          { createdAt: new Date(), duration: 1000 },
          { createdAt: new Date(), duration: 1000 },
        ],
      },
      expected: 2000,
    },
  ])('$name', async ({ expected, fixture }) => {
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

    const output = await getReviewTime()

    expect(output).toEqual(expected)

    resetDatabaseMock()
  })
})
