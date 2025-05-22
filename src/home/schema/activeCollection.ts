import { integer } from 'drizzle-orm/sqlite-core'
import { collection } from '@/collections/schema'

export const activeCollection = integer().references(() => collection.id, {
  onDelete: 'set null',
})
