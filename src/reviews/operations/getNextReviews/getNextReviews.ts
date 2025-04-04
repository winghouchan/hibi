import {
  and,
  asc,
  desc,
  eq,
  inArray,
  isNull,
  lt,
  not,
  or,
  sql,
} from 'drizzle-orm'
import { collection, collectionToNote } from '@/collections/schema'
import { database, tracer } from '@/data/database'
import { note, noteField } from '@/notes/schema'
import {
  reviewable,
  reviewableField,
  reviewableSnapshot,
} from '@/reviews/schema'
import MAX_REVIEW_COUNT from '../../maxReviewCount'

interface Options {
  filter?: {
    collections?: (typeof collection.$inferSelect)['id'][]
    due?: boolean
  }
  pagination?: {
    limit?: number
  }
}

async function getNextReviews({ filter, pagination }: Options = {}) {
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
  const nextReviewables = await database
    .select()
    .from(reviewable)
    .leftJoin(latestSnapshot, eq(reviewable.id, latestSnapshot.reviewable))
    .innerJoin(note, eq(reviewable.note, note.id))
    .innerJoin(collectionToNote, eq(note.id, collectionToNote.note))
    .where(
      and(
        not(eq(reviewable.archived, true)),
        filter?.due
          ? or(
              lt(latestSnapshot.due, sql`(unixepoch('now', 'subsec') * 1000)`),
              isNull(latestSnapshot.due),
            )
          : undefined,
        filter?.collections && filter.collections.length > 0
          ? inArray(collectionToNote.collection, filter.collections)
          : undefined,
      ),
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
    .limit(pagination?.limit ?? MAX_REVIEW_COUNT)

  const reviewables = await Promise.all(
    nextReviewables.map(async ({ reviewable: nextReviewable }) => {
      const fields = (
        await database
          .select({
            side: reviewableField.side,
            position: noteField.position,
            value: noteField.value,
          })
          .from(reviewableField)
          .where(eq(reviewableField.reviewable, nextReviewable.id))
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

      return { id: nextReviewable.id, fields }
    }),
  )

  return {
    reviewables,
  }
}

export default tracer.withSpan({ name: 'getNextReviews' }, getNextReviews)
