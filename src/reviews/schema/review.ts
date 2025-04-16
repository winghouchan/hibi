import { InferInsertModel, InferSelectModel, sql } from 'drizzle-orm'
import { check, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createdAt } from '@/data/database/utils'
import { reviewable } from './reviewable'

export const review = sqliteTable(
  'review',
  {
    id: integer().primaryKey({ autoIncrement: true }),

    /**
     * The reviewable (combination of fields in a prompt/answer relationship)
     * that this review is related to.
     */
    reviewable: integer()
      .references(() => reviewable.id)
      .notNull(),

    /**
     * The rating of the difficulty in recalling the answer for the review.
     */
    rating: integer().notNull(),

    /**
     * The amount of time, in milliseconds, the user took to complete the review.
     */
    duration: integer().notNull(),

    /**
     * The date and time the review was completed at.
     */
    createdAt: createdAt(),

    /**
     * Determines if a small pseudo-random delay is added to the due date of the
     * next review. This is to minimise groups of the same reviewables appearing
     * together in the same reviews. The delay is pseudo-random because the random
     * number generator is seeded with some properties of the reviewable.
     *
     * @see {@link https://github.com/open-spaced-repetition/ts-fsrs/blob/eee4f0c84f91d36f06f8fd55830f319d6a98e146/src/fsrs/algorithm.ts#L130-L147 | Source code for fuzzing in the scheduler}
     */
    dueFuzzed: integer('is_due_fuzzed', { mode: 'boolean' }).notNull(),

    /**
     * Determines if cards should go through the "learning" stage. It may be
     * disabled if, for example, the user already knows the information.
     *
     * @see {@link https://github.com/open-spaced-repetition/ts-fsrs/issues/98 | PR in the scheduler for additional context}
     */
    learningEnabled: integer('is_learning_enabled', {
      mode: 'boolean',
    }).notNull(),

    /**
     * Determines the maximum number of days between reviews.
     */
    maxInterval: integer().notNull(),

    /**
     * The target probability of recall at the next review.
     */
    retention: integer().notNull(),

    /**
     * An array with parameters passed to the scheduling algorithm. The parameters
     * are:
     *
     * - Initial stability (Rating: Again)
     * - Initial stability (Rating: Hard)
     * - Initial stability (Rating: Good)
     * - Initial stability (Rating: Easy)
     * - Initial difficulty (Rating: Good)
     * - Initial difficulty (Multiplier)
     * - Difficulty (Multiplier)
     * - Difficulty (Multiplier)
     * - Stability (Exponent)
     * - Stability (Negative power)
     * - Stability (Exponent)
     * - Fail stability (Multipler)
     * - Fail stability (Negative power)
     * - Fail stability (Power)
     * - Fail stability (Exponent)
     * - Stability (Multiplier) (Rating: Hard)
     * - Stability (Multiplier) (Rating: Easy)
     * - Short-term stability (Exponent)
     * - Short-term stability (Exponent)
     *
     * @see {@link https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm | Wiki on the algorithm}
     * @see {@link https://github.com/open-spaced-repetition/ts-fsrs/blob/65fd676414e23e21612b5344af947480f7dafa7e/src/fsrs/default.ts#L6-L10 | Source code for the default parameters}
     * @see {@link https://github.com/open-spaced-repetition/anki_fsrs_visualizer/blob/785e2d37851fa3fa9b59c2e9f30e4d7237fa781e/src/sliderInfo.ts#L24-L42 | Source for parameter names}
     */
    weights: text({ mode: 'json' }).notNull(),
  },
  ({
    rating,
    duration,
    dueFuzzed,
    learningEnabled,
    maxInterval,
    retention,
    weights,
  }) => [
    /**
     * A constraint to check the rating is valid. Each number represents the
     * following rating:
     *
     * - 0: Manual
     * - 1: Again
     * - 2: Hard
     * - 3: Good
     * - 4: Easy
     *
     * @see {@link https://open-spaced-repetition.github.io/ts-fsrs/enums/Rating.html | Documentation on ratings in the scheduler}
     */
    check('review_rating_is_valid', sql`${rating} IN (0, 1, 2, 3, 4)`),

    check('review_duration_greater_than_zero', sql`${duration} > 0`),

    check(
      'review_is_due_fuzzed_is_boolean',
      sql`${dueFuzzed} IN (true, false)`,
    ),

    check(
      'review_is_learning_enabled_is_boolean',
      sql`${learningEnabled} IN (true, false)`,
    ),

    check('review_max_interval_greater_than_zero', sql`${maxInterval} > 0`),

    check(
      'review_retention_in_range',
      sql`${retention} >= 0 AND ${retention} <= 100`,
    ),

    /**
     * A constraint to reduce the risk of incorrect weights. There are 19
     * components to the weight parameter passed to FSRS.
     *
     * @see {@link https://github.com/open-spaced-repetition/ts-fsrs/blob/65fd676414e23e21612b5344af947480f7dafa7e/src/fsrs/default.ts#L6-L10 | Source code for the default parameters}
     */
    check('review_weights_is_valid', sql`json_array_length(${weights}) >= 19`),
  ],
)

export type Review = InferSelectModel<typeof review>
export type ReviewParameters = InferInsertModel<typeof review>
