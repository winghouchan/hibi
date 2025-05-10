import { sql } from 'drizzle-orm'
import { database, tracer } from '@/data/database'
import { review } from '@/reviews/schema'

const localizedDates = database
  .selectDistinct({
    localizedDate: sql`date(
      ${review.createdAt} / 1000,
      'unixepoch',
      ${review.createdAtOffset}
    )`.as('localized_date'),
  })
  .from(review)

const currentStreakQuery = sql`
  with recursive
    localized_dates as ${localizedDates},
    consecutive_dates_with_reviews(date) as (
      select max(localized_date)
      from localized_dates
      where localized_date >= date('now', 'localtime', '-1 day')

      union all

      select date(date, '-1 day')
      from consecutive_dates_with_reviews
      where
        date is not null
        and exists (
          select 1 from localized_dates
          where localized_date = date(date, '-1 day')
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
