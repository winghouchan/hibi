import { sum } from 'drizzle-orm'
import { database, tracer } from '@/data/database'
import { review } from '@/reviews/schema'

async function getReviewTime() {
  const [{ reviewTime }] = await database
    .select({ reviewTime: sum(review.duration).mapWith(Number) })
    .from(review)

  return reviewTime ?? 0
}

export default tracer.withSpan({ name: 'getReviewTime' }, getReviewTime)
