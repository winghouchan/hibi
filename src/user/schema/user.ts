import { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { integer, sqliteTable } from 'drizzle-orm/sqlite-core'
import { createdAt } from '@/data/database/utils'
import { activeCollection } from '@/home/schema'
import { onboarded } from '@/onboarding/schema'

export const user = sqliteTable('user', {
  id: integer().primaryKey({ autoIncrement: true }),

  createdAt: createdAt(),

  activeCollection,
  onboarded,
})

export type User = InferSelectModel<typeof user>
export type UserParameters = InferInsertModel<typeof user>
