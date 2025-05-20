import { integer } from 'drizzle-orm/sqlite-core'

export const onboarded = integer('is_onboarded', { mode: 'boolean' })
  .notNull()
  .default(false)
