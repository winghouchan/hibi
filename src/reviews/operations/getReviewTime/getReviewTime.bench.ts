import { sub } from 'date-fns'
import { random } from 'lodash'
import { measureAsyncFunction } from 'reassure'
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

describe('getReviewTime', () => {
  test.each([
    {
      name: 'when 0 reviews have been completed',
      variables: {
        reviews: 0,
      },
    },
    {
      name: 'when 1 review has been completed',
      variables: {
        reviews: 1,
      },
    },
    {
      name: 'when 10 reviews have been completed',
      variables: {
        reviews: 10,
      },
    },
    {
      name: 'when 100 reviews have been completed',
      variables: {
        reviews: 100,
      },
    },
    {
      name: 'when 1000 reviews have been completed',
      variables: {
        reviews: 1000,
      },
    },
  ])('$name', async ({ variables }) => {
    const { database, resetDatabaseMock } = await mockDatabase()
    const { default: getReviewTime } = await import('./getReviewTime')

    const [{ id: noteId }] = await database.insert(note).values({}).returning()
    const [{ id: reviewableId }] = await database
      .insert(reviewable)
      .values({ note: noteId })
      .returning()
    const reviews = Array.from({ length: variables.reviews }, (_, index) => ({
      createdAt: sub(new Date(), { days: variables.reviews - index }),
      reviewable: reviewableId,
      ...mockReview(),
    }))

    if (reviews.length > 0) {
      await database.insert(review).values(reviews)
    }

    await measureAsyncFunction(() => getReviewTime())

    resetDatabaseMock()
  })
})
