import { and, count, desc, eq } from 'drizzle-orm'
import {
  fsrs,
  generatorParameters as schedulerParameters,
  Grade,
  Rating,
  State,
} from 'ts-fsrs'
import { database } from '@/data'
import { review, reviewableSnapshot } from '../schema'

interface CreateReviewParameters {
  reviewable: number
  rating: Grade
  duration: number
}

export default async function createReview({
  reviewable,
  rating,
  duration,
}: CreateReviewParameters) {
  return await database.transaction(async (transaction) => {
    const [{ reps }] = await transaction
      .select({ reps: count() })
      .from(review)
      .where(eq(review.reviewable, reviewable))
    const [{ lapses }] = await transaction
      .select({ lapses: count() })
      .from(review)
      .where(
        and(eq(review.reviewable, reviewable), eq(review.rating, Rating.Again)),
      )
    const [{ lastReview = undefined } = {}] = await transaction
      .select({ lastReview: review.createdAt })
      .from(review)
      .where(eq(review.reviewable, reviewable))
      .orderBy(desc(review.createdAt))
      .limit(1)
    const lastSnapshot = (await transaction.query.reviewableSnapshot.findFirst({
      columns: {
        difficulty: true,
        due: true,
        stability: true,
        state: true,
      },
      where: eq(reviewableSnapshot.reviewable, reviewable),
      orderBy: [desc(reviewableSnapshot.createdAt)],
    })) ?? {
      difficulty: 0,
      due: new Date(),
      stability: 0,
      state: State.New,
    }

    const {
      enable_fuzz,
      enable_short_term,
      maximum_interval,
      request_retention,
      w,
    } = schedulerParameters()
    const scheduler = fsrs({
      enable_fuzz,
      enable_short_term,
      maximum_interval,
      request_retention,
      w,
    })

    const [insertedReview] = await transaction
      .insert(review)
      .values({
        reviewable,
        rating,
        duration,
        dueFuzzed: enable_fuzz,
        maxInterval: maximum_interval,
        retention: request_retention * 100,
        learningEnabled: enable_short_term,
        weights: w,
      })
      .returning()

    const { due, difficulty, stability, state } = scheduler.next(
      {
        ...lastSnapshot,
        last_review: lastReview,
        lapses,
        reps,

        /*
         * These values are not significant. However they need to be defined because of
         * the type definition for this parameter. The reasoning for the insignificance
         * is as follows:
         * - `next` is defined at [1]
         * - this argument is passed to `Schduler`, which is defined at [2]
         * - `Schduler` can be either (of which neither read the values):
         *   - `BasicScheduler` [3]
         *   - `LongTermScheduler` [4]
         * - Both extend `AbstractScheduler`, which is defined at [5]
         * - `AbstractScheduler` only uses `elapsed_days` to set `last_elapsed_days` in the `log` return by various functions (including `next`) [6]
         * - `log` is not used in our code
         * - Note, it may look like the values are used, however check which object owns it and if they have been or are being re-assigned a new value. Examples:
         *   - `this.current.elapsed_days` is being re-assigned a new value: [7]
         *   - `next.scheduled_days`, where `next` is an alias of `this.current`, is being re-assigned a new value: [8]
         *
         * [1](https://github.com/open-spaced-repetition/ts-fsrs/blob/65fd676414e23e21612b5344af947480f7dafa7e/src/fsrs/fsrs.ts#L178-L196)
         * [2](https://github.com/open-spaced-repetition/ts-fsrs/blob/65fd676414e23e21612b5344af947480f7dafa7e/src/fsrs/fsrs.ts#L27)
         * [3](https://github.com/open-spaced-repetition/ts-fsrs/blob/65fd676414e23e21612b5344af947480f7dafa7e/src/fsrs/impl/basic_schduler.ts)
         * [4](https://github.com/open-spaced-repetition/ts-fsrs/blob/65fd676414e23e21612b5344af947480f7dafa7e/src/fsrs/impl/long_term_schduler.ts)
         * [5](https://github.com/open-spaced-repetition/ts-fsrs/blob/65fd676414e23e21612b5344af947480f7dafa7e/src/fsrs/abstract_schduler.ts)
         * [6](https://github.com/open-spaced-repetition/ts-fsrs/blob/65fd676414e23e21612b5344af947480f7dafa7e/src/fsrs/abstract_schduler.ts#L90-L104)
         * [7](https://github.com/open-spaced-repetition/ts-fsrs/blob/65fd676414e23e21612b5344af947480f7dafa7e/src/fsrs/abstract_schduler.ts#L23-L46)
         * [8](https://github.com/open-spaced-repetition/ts-fsrs/blob/65fd676414e23e21612b5344af947480f7dafa7e/src/fsrs/impl/basic_schduler.ts#L24)
         */
        elapsed_days: 0,
        scheduled_days: 0,
      },
      insertedReview.createdAt,
      rating,
    ).card

    const [insertedSnapshot] = await transaction
      .insert(reviewableSnapshot)
      .values({
        createdAt: insertedReview.createdAt,
        review: insertedReview.id,
        difficulty,
        due,
        reviewable,
        stability,
        state,
      })
      .returning()

    return {
      review: insertedReview,
      snapshot: insertedSnapshot,
    }
  })
}
