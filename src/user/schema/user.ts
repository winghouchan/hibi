import { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { integer, sqliteTable } from 'drizzle-orm/sqlite-core'
import { createdAt } from '@/data/database/utils'
import * as onboardingSchema from '@/onboarding/schema'

export const user = sqliteTable('user', {
  id: integer().primaryKey({ autoIncrement: true }),

  createdAt: createdAt(),

  ...onboardingSchema.onboarded,
})

export type User = InferSelectModel<typeof user>
export type UserParameters = InferInsertModel<typeof user>
