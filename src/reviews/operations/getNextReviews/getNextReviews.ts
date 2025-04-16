import {
  and,
  asc,
  eq,
  inArray,
  isNull,
  lt,
  max,
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
   * Latest snapshot for each reviewable
   */
  const latestSnapshots = database.$with('latest_snapshots').as(
    database
      .select({
        reviewable: reviewableSnapshot.reviewable,
        due: max(reviewableSnapshot.due).as('due'),
      })
      .from(reviewableSnapshot)
      .groupBy(reviewableSnapshot.reviewable),
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
    .with(latestSnapshots, reviewables, reviewableFields)
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
