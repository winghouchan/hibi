import { asc, desc, eq, sql } from 'drizzle-orm'
import { database } from '@/data'
import { reviewable, reviewableSnapshot } from '@/reviews/schema'

export default async function getNextReview() {
  /**
   * Partitions by reviewable ordered by created dates descending
   */
  const snapshotsByReviewable = database
    .select({
      due: reviewableSnapshot.due,
      reviewable: reviewableSnapshot.reviewable,
      row: sql<number>`
        row_number() over (
          partition by ${reviewableSnapshot.reviewable}
          order by ${desc(reviewableSnapshot.createdAt)}
        )`.as('row'),
    })
    .from(reviewableSnapshot)
    .as('snapshots_by_reviewable')

  /**
   * Latest snapshot for each reviewable
   */
  const latestSnapshot = database
    .select()
    .from(snapshotsByReviewable)
    /**
     * As snapshots by reviewable are ordered by created dates, the first row
     * will be the latest snapshot, see `snapshotsByReviewable` above.
     *
     * Using a combination of `group by` and `max(created_at)` in a query on
     * the `reviewable_snapshot` table might appear to work however the value
     * of other columns will be from a row arbitrarily chosen from the group
     * so will not be guaranteed to be from the row with the latest created
     * date.
     *
     * @see {@link https://www.sqlite.org/lang_select.html#generation_of_the_set_of_result_rows | SQLite documentation}
     */
    .where(eq(snapshotsByReviewable.row, 1))
    .as('latest_snapshot')

  /**
   * Reviewables joined against their latest snapshots
   */
  const [result] = await database
    .select()
    .from(reviewable)
    .leftJoin(latestSnapshot, eq(reviewable.id, latestSnapshot.reviewable))
    .orderBy(sql`${asc(latestSnapshot.due)} nulls last`)
    .limit(1)

  return result?.reviewable ?? null
}
