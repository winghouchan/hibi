import { and, count, gte, lt } from 'drizzle-orm'
import { database, tracer } from '@/data/database'
import { review } from '@/reviews/schema'

interface Options {
  from?: Date
  to?: Date
}

async function getReviewCount({ from, to }: Options = {}) {
  const [{ reviewCount }] = await database
    .select({ reviewCount: count() })
    .from(review)
    .where(
      and(from && gte(review.createdAt, from), to && lt(review.createdAt, to)),
    )

  return reviewCount
}

export default tracer.withSpan({ name: 'getReviewCount' }, getReviewCount)
