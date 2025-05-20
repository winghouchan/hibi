import { count } from 'drizzle-orm'
import { database, tracer } from '@/data/database'
import { review } from '@/reviews/schema'

async function getReviewCount() {
  const [{ reviewCount }] = await database
    .select({ reviewCount: count() })
    .from(review)

  return reviewCount
}

export default tracer.withSpan({ name: 'getReviewCount' }, getReviewCount)
