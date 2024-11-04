import { createdAt } from '@/data/database/utils'
import * as onboardingSchema from '@/onboarding/schema'
import { integer, sqliteTable } from 'drizzle-orm/sqlite-core'

export const user = sqliteTable('user', {
  id: integer().primaryKey({ autoIncrement: true }),

  createdAt: createdAt(),

  ...onboardingSchema.onboarded,
})
