import { InferInsertModel, InferSelectModel, sql } from 'drizzle-orm'
import {
  check,
  index,
  integer,
  real,
  sqliteTable,
} from 'drizzle-orm/sqlite-core'
import { createdAt } from '@/data/database/utils'
import { review } from './review'
import { reviewable } from './reviewable'

export const reviewableSnapshot = sqliteTable(
  'reviewable_snapshot',
  {
    id: integer().primaryKey({ autoIncrement: true }),

    reviewable: integer()
      .references(() => reviewable.id)
      .notNull(),

    review: integer()
      .references(() => review.id)
      .notNull(),

    /**
     * The resulting difficulty of the reviewable.
     */
    difficulty: real().notNull(),

    /**
     * The resulting due date and time of the reviewable.
     */
    due: integer({ mode: 'timestamp_ms' }).notNull(),

    /**
     * The resulting stability of the reviewable.
     */
    stability: real().notNull(),

    /**
     * The resulting state of the reviewable.
     */
    state: integer().notNull(),

    createdAt: createdAt(),
  },
  ({ difficulty, reviewable, stability, state }) => [
    check(
      'reviewable_snapshot_difficulty_greater_than_zero',
      sql`${difficulty} > 0`,
    ),

    check(
      'reviewable_snapshot_stability_greater_than_zero',
      sql`${stability} > 0`,
    ),

    /**
     * A constraint to check the state is valid. Each number represents the
     * following state:
     *
     * - 0: New
     * - 1: Learning
     * - 2: Review
     * - 3: Re-learning
     *
     * @see {@link https://open-spaced-repetition.github.io/ts-fsrs/enums/State.html | Documentation on states in the scheduler}
     */
    check('reviewable_snapshot_state_is_valid', sql`${state} IN (0, 1, 2, 3)`),

    index('index_reviewable_snapshot_reviewable').on(reviewable),
  ],
)

export type ReviewableSnapshot = InferSelectModel<typeof reviewableSnapshot>
export type ReviewableSnapshotParameters = InferInsertModel<
  typeof reviewableSnapshot
>
