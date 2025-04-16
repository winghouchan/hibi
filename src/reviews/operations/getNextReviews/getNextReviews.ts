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
import { Collection, collectionToNote } from '@/collections/schema'
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
    collections?: Collection['id'][]
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
  const snapshotsByReviewable = database.$with('snapshots_by_reviewable').as(
    database
      .select({
        due: reviewableSnapshot.due,
        reviewable: reviewableSnapshot.reviewable,
        /**
         * Creates partitions (i.e. groups) of snapshots based on the reviewable
         * the snapshot is for.
         *
         * Using a combination of `group by` and `max(created_at)` might appear to
         * work however the value of other columns will be from a row arbitrarily
         * chosen from the group so will not be guaranteed to be from the row with
         * the latest created date.
         *
         * @see {@link https://www.sqlite.org/lang_select.html#generation_of_the_set_of_result_rows | SQLite documentation}
         */
        row: sql<number>`
          row_number() over (
            partition by ${reviewableSnapshot.reviewable}
            order by ${desc(reviewableSnapshot.createdAt)}
          )
        `.as('row'),
      })
      .from(reviewableSnapshot),
  )

  /**
   * Latest snapshot for each reviewable
   */
  const latestSnapshots = database.$with('latest_snapshots').as(
    database
      .select()
      .from(snapshotsByReviewable)
      /**
       * As snapshots by reviewable are ordered by created dates descending, the
       * first row will be the latest snapshot, see `snapshotsByReviewable` above.
       */
      .where(eq(snapshotsByReviewable.row, 1)),
  )

  /**
   * Reviewables which are due or not have been reviewed and match any filters
   */
  const reviewables = database.$with('reviewables').as(
    database
      .select({
        id: reviewable.id,
        due: latestSnapshots.due,
      })
      .from(reviewable)
      .leftJoin(latestSnapshots, eq(reviewable.id, latestSnapshots.reviewable))
      .innerJoin(note, eq(reviewable.note, note.id))
      .innerJoin(collectionToNote, eq(note.id, collectionToNote.note))
      .where(
        and(
          not(eq(reviewable.archived, true)),
          filter?.due
            ? or(
                lt(
                  latestSnapshots.due,
                  sql`(unixepoch('now', 'subsec') * 1000)`,
                ),
                isNull(latestSnapshots.due),
              )
            : undefined,
          filter?.collections && filter.collections.length > 0
            ? inArray(collectionToNote.collection, filter.collections)
            : undefined,
        ),
      ),
  )

  /**
   * Reviewable fields grouped by reviewable and side in a JSON array
   *
   * Example:
   *
   * | reviewable | fields                                                               |
   * | ---------- | -------------------------------------------------------------------- |
   * |          1 | [{ side: 0, position: 0, ... }, { side: 0, position: 1, ... }, ... ] |
   * |          2 | [{ side: 0, position: 0, ... }, { side: 0, position: 1, ... }, ... ] |
   * |          1 | [{ side: 1, position: 0, ... }, { side: 1, position: 1, ... }, ... ] |
   * |          2 | [{ side: 1, position: 0, ... }, { side: 1, position: 1, ... }, ... ] |
   */
  const reviewableFields = database.$with('reviewable_fields').as(
    database
      .select({
        reviewable: reviewableField.reviewable,
        fields: sql`
          json_group_array(
            json_object(
              'reviewable', ${reviewableField.reviewable},
              'side', ${reviewableField.side},
              'position', ${noteField.position},
              'value', ${noteField.value}
            )
          )
        `.as('fields'),
      })
      .from(reviewableField)
      .innerJoin(noteField, eq(reviewableField.field, noteField.id))
      .innerJoin(reviewables, eq(reviewableField.reviewable, reviewables.id))
      .groupBy(reviewableField.reviewable, reviewableField.side)
      .orderBy(asc(reviewableField.side), asc(noteField.position)),
  )

  /**
   * Reviewables joined against their fields
   */
  const reviewablesWithFields = await database
    .with(snapshotsByReviewable, latestSnapshots, reviewables, reviewableFields)
    .select({
      id: reviewables.id,
      fields: sql`json_group_array(${reviewableFields.fields})`
        .mapWith({
          mapFromDriverValue: (value) =>
            (JSON.parse(value) as string[]).map((value) => JSON.parse(value)),
        })
        .as('fields'),
    })
    .from(reviewables)
    .innerJoin(
      reviewableFields,
      eq(reviewables.id, reviewableFields.reviewable),
    )
    .groupBy(reviewables.id)
    .orderBy(
      sql`
        case
          when ${lt(reviewables.due, sql`unixepoch('now', 'subsec') * 1000`)} then 0
          when ${isNull(reviewables.due)} then 1
          else 2
        end
      `,
      asc(reviewables.due),
    )
    .limit(pagination?.limit ?? MAX_REVIEW_COUNT)

  return { reviewables: reviewablesWithFields }
}

export default tracer.withSpan({ name: 'getNextReviews' }, getNextReviews)
