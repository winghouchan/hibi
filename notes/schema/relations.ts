import { collectionToNote } from '@/collections/schema/relations'
import { reviewable, reviewableField } from '@/reviews/schema/reviewable'
import { relations } from 'drizzle-orm'
import { noteField, note } from './note'

export const noteRelations = relations(note, ({ many }) => ({
  collections: many(collectionToNote),
  fields: many(noteField),
  reviewables: many(reviewable),
}))

export const fieldRelations = relations(noteField, ({ many, one }) => ({
  note: one(note, {
    fields: [noteField.note],
    references: [note.id],
  }),
  reviewableFields: many(reviewableField),
}))
