import { and, gte, lt, sum } from 'drizzle-orm'
import { database, tracer } from '@/data/database'
import { review } from '@/reviews/schema'

interface Options {
  from?: Date
  to?: Date
}

async function getReviewTime({ from, to }: Options = {}) {
  const [{ reviewTime }] = await database
    .select({ reviewTime: sum(review.duration).mapWith(Number) })
    .from(review)
    .where(
      and(from && gte(review.createdAt, from), to && lt(review.createdAt, to)),
    )

  return reviewTime ?? 0
}

export default tracer.withSpan({ name: 'getReviewTime' }, getReviewTime)
