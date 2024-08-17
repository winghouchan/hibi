import { note, noteField } from '@/notes/schema/note.schema'
import { relations } from 'drizzle-orm'
import { review, reviewableSnapshot } from './review.schema'
import { reviewable, reviewableField } from './reviewable.schema'

export const reviewableRelations = relations(reviewable, ({ many, one }) => ({
  note: one(note, {
    fields: [reviewable.note],
    references: [note.id],
  }),
  fields: many(reviewableField),
  reviews: many(review),
  snapshots: many(reviewableSnapshot),
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

export const reviewRelations = relations(review, ({ one }) => ({
  reviewable: one(reviewable, {
    fields: [review.reviewable],
    references: [reviewable.id],
  }),
}))

export const reviewableSnapshotRelations = relations(
  reviewableSnapshot,
  ({ one }) => ({
    review: one(review, {
      fields: [reviewableSnapshot.review],
      references: [review.id],
    }),
  }),
)
