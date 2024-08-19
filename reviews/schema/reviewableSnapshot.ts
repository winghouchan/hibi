import { createdAt } from '@/database/utils'
import { integer, real, sqliteTable } from 'drizzle-orm/sqlite-core'
import { review } from './review'
import { reviewable } from './reviewable'

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
