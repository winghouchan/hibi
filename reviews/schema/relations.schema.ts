import { note, noteField } from '@/notes/schema/note.schema'
import { relations } from 'drizzle-orm'
import { reviewable, reviewableField } from './reviewable.schema'

export const reviewableRelations = relations(reviewable, ({ many, one }) => ({
  note: one(note, {
    fields: [reviewable.note],
    references: [note.id],
  }),
  fields: many(reviewableField),
}))

export const reviewableFieldRelations = relations(
  reviewableField,
  ({ one }) => ({
    reviewable: one(reviewable, {
      fields: [reviewableField.reviewable],
      references: [reviewable.id],
    }),
    field: one(noteField, {
      fields: [reviewableField.field],
      references: [noteField.id],
    }),
  }),
)
