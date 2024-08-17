import { createdAt } from '@/database/utils'
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { reviewable } from './reviewable'

export const review = sqliteTable('review', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  /**
   * The reviewable (combination of fields in a prompt/answer relationship) that
   * this review is related to.
   */
  reviewable: integer('reviewable')
    .references(() => reviewable.id)
    .notNull(),

  /**
   * The rating of the difficulty in recalling the answer for the review.
   */
  rating: integer('rating').notNull(),

  /**
   * The amount of time, in milliseconds, the user took to complete the review.
   *
   * NOTE: the `duration` column has an additional constraint against values
   * below 0. The migration has been manually modified to include this because
   * Drizzle currently does not have support for adding check constraints.
   */
  duration: integer('duration').notNull(),

  /**
   * The date and time the review was completed at.
   */
  created_at: createdAt(),

  /**
   * Determines if a small pseudo-random delay is added to the due date of the
   * next review. This is to minimise groups of the same reviewables appearing
   * together in the same reviews. The delay is pseudo-random because the random
   * number generator is seeded with some properties of the reviewable.
   *
   * NOTE: the `is_due_fuzzed` column has an additional constraint against
   * non-boolean values. The migration has been manually modified to include this
   * because Drizzle currently does not have support for adding check constraints.
   *
   * @see {@link https://github.com/open-spaced-repetition/ts-fsrs/blob/eee4f0c84f91d36f06f8fd55830f319d6a98e146/src/fsrs/algorithm.ts#L130-L147 | Source code for fuzzing in the scheduler}
   */
  is_due_fuzzed: integer('is_due_fuzzed', { mode: 'boolean' }).notNull(),

  /**
   * Determines if cards should go through the "learning" stage. It may be
   * disabled if, for example, the user already knows the information.
   *
   * NOTE: the `is_learning_enabled` column has an additional constraint against
   * non-boolean values. The migration has been manually modified to include this
   * because Drizzle currently does not have support for adding check constraints.
   */
  is_learning_enabled: integer('is_learning_enabled', {
    mode: 'boolean',
  }).notNull(),

  /**
   * Determines the maximum number of days between reviews.
   *
   * NOTE: the `max_interval` column has an additional constraint against values
   * below 0. The migration has been manually modified to include this because
   * Drizzle currently does not have support for adding check constraints.
   */
  max_interval: integer('max_interval').notNull(),

  /**
   * The target probability of recall at the next review.
   *
   * NOTE: the `retention` column has an additional constraint against values
   * outside the range of `0` to `100` (inclusive). The migration has been
   * manually modified to include this because Drizzle currently does not have
   * support for adding check constraints.
   */
  retention: integer('retention').notNull(),

  /**
   * An array with parameters passed to the scheduling algorithm.
   */
  weights: text('weights', { mode: 'json' }).notNull(),
})

export const reviewableSnapshot = sqliteTable('reviewable_snapshot', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  reviewable: integer('reviewable')
    .references(() => reviewable.id)
    .notNull(),

  review: integer('review')
    .references(() => review.id)
    .notNull(),

  /**
   * The resulting difficulty of the reviewable.
   *
   * NOTE: the `difficulty` column has an additional constraint against values
   * below 0. The migration has been manually modified to include this because
   * Drizzle currently does not have support for adding check constraints.
   */
  difficulty: real('difficulty').notNull(),

  /**
   * The resulting due date and time of the reviewable.
   */
  due: integer('due', { mode: 'timestamp_ms' }).notNull(),

  /**
   * The resulting stability of the reviewable.
   *
   * NOTE: the `stability` column has an additional constraint against values
   * below 0. The migration has been manually modified to include this because
   * Drizzle currently does not have support for adding check constraints.
   */
  stability: real('stability').notNull(),

  /**
   * The resulting state of the reviewable.
   */
  state: integer('state').notNull(),

  created_at: createdAt(),
})
