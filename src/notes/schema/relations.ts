import { relations } from 'drizzle-orm'
import { collectionToNote } from '@/collections/schema/relations'
import { reviewable, reviewableField } from '@/reviews/schema/reviewable'
import { note } from './note'
import { noteField } from './noteField'

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
