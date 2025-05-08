import { sql } from 'drizzle-orm'
import { database, tracer } from '@/data/database'
import { review } from '@/reviews/schema'

const currentStreakQuery = sql`
  with recursive consecutive_dates_with_reviews(date) as (
    select max(date(${review.createdAt} / 1000, 'unixepoch'))
    from ${review}
    where date(${review.createdAt} / 1000, 'unixepoch') >= date('now', '-1 day')

    union all

    select date(date, '-1 day')
    from consecutive_dates_with_reviews
    where
      date is not null
      and exists (
        select 1 from ${review}
        where date(${review.createdAt} / 1000, 'unixepoch') = date(date, '-1 day')
      )
  )
  select count(*) as streak
  from consecutive_dates_with_reviews
  where date is not null
`

async function getCurrentStreak() {
  const { streak } = await database.get<{ streak: number }>(currentStreakQuery)

  return streak
}

export default tracer.withSpan({ name: 'getCurrentStreak' }, getCurrentStreak)
