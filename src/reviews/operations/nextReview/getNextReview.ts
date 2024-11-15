import { asc, desc, eq, isNull, lt, sql } from 'drizzle-orm'
import { database } from '@/data'
import { noteField } from '@/notes/schema'
import {
  reviewable,
  reviewableField,
  reviewableSnapshot,
} from '@/reviews/schema'

interface Options {
  onlyDue?: boolean
}

export default async function getNextReview(options?: Options) {
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
  const [nextReviewable] = await database
    .select()
    .from(reviewable)
    .leftJoin(latestSnapshot, eq(reviewable.id, latestSnapshot.reviewable))
    .where(
      options?.onlyDue
        ? lt(latestSnapshot.due, sql`(unixepoch('now', 'subsec') * 1000)`)
        : undefined,
    )
    .orderBy(
      sql`
        case
          when ${lt(latestSnapshot.due, sql`unixepoch('now', 'subsec') * 1000`)} then 0
          when ${isNull(latestSnapshot.due)} then 1
          else 2
        end
      `,
      asc(latestSnapshot.due),
    )
    .limit(1)

  const fields = nextReviewable
    ? (
        await database
          .select({
            side: reviewableField.side,
            position: noteField.position,
            value: noteField.value,
          })
          .from(reviewableField)
          .where(eq(reviewableField.reviewable, nextReviewable.reviewable.id))
          .innerJoin(noteField, eq(reviewableField.field, noteField.id))
          .orderBy(asc(reviewableField.side), asc(noteField.position))
      ).reduce<
        (Pick<typeof reviewableField.$inferSelect, 'side'> &
          Pick<typeof noteField.$inferSelect, 'position' | 'value'>)[][]
      >((state, field) => {
        const newState = [...state]

        if (newState[field.side]) {
          newState[field.side].push(field)
        } else {
          newState[field.side] = [field]
        }

        return newState
      }, [])
    : []

  return nextReviewable ? { id: nextReviewable.reviewable.id, fields } : null
}
