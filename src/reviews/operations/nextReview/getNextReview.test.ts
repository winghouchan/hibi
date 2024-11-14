import { add, sub } from 'date-fns'
import hashNoteFieldValue from '@/notes/hashNoteFieldValue'
import { note, noteField } from '@/notes/schema'
import {
  review,
  reviewable,
  reviewableField,
  reviewableSnapshot,
} from '@/reviews/schema'
import { mockDatabase } from 'test/utils'

describe('getNextReview', () => {
  describe.each([{ onlyDue: false }, { onlyDue: true }])(
    'when `onlyDue` is `$onlyDue`',
    (options) => {
      describe.each([
        {
          when: 'there are no reviewables',
          then: 'returns `null`',
          expected: null,
        },
        {
          when: 'there is 1 reviewable with no snapshots',
          then: options.onlyDue ? 'returns `null`' : 'returns the reviewable',
          fixture: {
            reviewables: [
              {
                id: 1,
                fields: [
                  { side: 0, position: 0, value: 'Front' },
                  { side: 1, position: 0, value: 'Back' },
                ],
                snapshots: [],
              },
            ],
          },
          expected: options.onlyDue
            ? null
            : expect.objectContaining({
                id: 1,
                fields: [
                  expect.objectContaining({ value: 'Front' }),
                  expect.objectContaining({ value: 'Back' }),
                ],
              }),
        },
        {
          when: 'there is 1 reviewable with 1 snapshot with a due date in the past',
          then: 'returns the reviewable',
          fixture: {
            reviewables: [
              {
                id: 1,
                fields: [
                  { side: 0, position: 0, value: 'Front' },
                  { side: 1, position: 0, value: 'Back' },
                ],
                snapshots: [
                  {
                    due: sub(new Date(), { days: 1 }),
                    createdAt: sub(new Date(), { days: 2 }),
                  },
                ],
              },
            ],
          },
          expected: expect.objectContaining({
            id: 1,
            fields: [
              expect.objectContaining({ value: 'Front' }),
              expect.objectContaining({ value: 'Back' }),
            ],
          }),
        },
        {
          when: 'there is 1 reviewable with 1 snapshot with a due date in the future',
          then: options.onlyDue ? 'returns `null`' : 'returns the reviewable',
          fixture: {
            reviewables: [
              {
                id: 1,
                fields: [
                  { side: 0, position: 0, value: 'Front' },
                  { side: 1, position: 0, value: 'Back' },
                ],
                snapshots: [
                  {
                    due: add(new Date(), { days: 1 }),
                    createdAt: sub(new Date(), { days: 2 }),
                  },
                ],
              },
            ],
          },
          expected: options.onlyDue
            ? null
            : expect.objectContaining({
                id: 1,
                fields: [
                  expect.objectContaining({ value: 'Front' }),
                  expect.objectContaining({ value: 'Back' }),
                ],
              }),
        },
        {
          when: 'there is 1 reviewable with many snapshots with all due dates in the past',
          then: 'returns the reviewable',
          fixture: {
            reviewables: [
              {
                id: 1,
                fields: [
                  { side: 0, position: 0, value: 'Front' },
                  { side: 1, position: 0, value: 'Back' },
                ],
                snapshots: [
                  {
                    due: sub(new Date(), { days: 1 }),
                    createdAt: sub(new Date(), { days: 2 }),
                  },
                  {
                    due: sub(new Date(), { days: 2 }),
                    createdAt: sub(new Date(), { days: 3 }),
                  },
                ],
              },
            ],
          },
          expected: expect.objectContaining({
            id: 1,
            fields: [
              expect.objectContaining({ value: 'Front' }),
              expect.objectContaining({ value: 'Back' }),
            ],
          }),
        },
        {
          when: 'there is 1 reviewable with many snapshots with all due dates in the future',
          then: options.onlyDue ? 'returns `null`' : 'returns the reviewable',
          fixture: {
            reviewables: [
              {
                id: 1,
                fields: [
                  { side: 0, position: 0, value: 'Front' },
                  { side: 1, position: 0, value: 'Back' },
                ],
                snapshots: [
                  {
                    due: add(new Date(), { days: 1 }),
                    createdAt: sub(new Date(), { days: 2 }),
                  },
                  {
                    due: add(new Date(), { days: 2 }),
                    createdAt: sub(new Date(), { days: 3 }),
                  },
                ],
              },
            ],
          },
          expected: options.onlyDue
            ? null
            : expect.objectContaining({
                id: 1,
                fields: [
                  expect.objectContaining({ value: 'Front' }),
                  expect.objectContaining({ value: 'Back' }),
                ],
              }),
        },
        {
          when: 'there are many reviewables each with 1 snapshot with a due date in the past',
          then: 'returns the reviewable with the oldest due date',
          fixture: {
            reviewables: [
              {
                id: 1,
                fields: [
                  { side: 0, position: 0, value: 'Front 1' },
                  { side: 1, position: 0, value: 'Back 1' },
                ],
                snapshots: [
                  {
                    due: sub(new Date(), { days: 1 }),
                    createdAt: sub(new Date(), { days: 2 }),
                  },
                ],
              },
              {
                id: 2,
                fields: [
                  { side: 0, position: 0, value: 'Front 2' },
                  { side: 1, position: 0, value: 'Back 2' },
                ],
                snapshots: [
                  {
                    due: sub(new Date(), { days: 2 }),
                    createdAt: sub(new Date(), { days: 3 }),
                  },
                ],
              },
            ],
          },
          expected: expect.objectContaining({
            id: 2,
            fields: [
              expect.objectContaining({ value: 'Front 2' }),
              expect.objectContaining({ value: 'Back 2' }),
            ],
          }),
        },
        {
          when: 'there are many reviewables each with 1 snapshot with some due dates being in the past and some in the future',
          then: 'returns the reviewable with the oldest due date',
          fixture: {
            reviewables: [
              {
                id: 1,
                fields: [
                  { side: 0, position: 0, value: 'Front 1' },
                  { side: 1, position: 0, value: 'Back 1' },
                ],
                snapshots: [
                  {
                    due: add(new Date(), { days: 1 }),
                    createdAt: sub(new Date(), { days: 2 }),
                  },
                ],
              },
              {
                id: 2,
                fields: [
                  { side: 0, position: 0, value: 'Front 2' },
                  { side: 1, position: 0, value: 'Back 2' },
                ],
                snapshots: [
                  {
                    due: sub(new Date(), { days: 1 }),
                    createdAt: sub(new Date(), { days: 2 }),
                  },
                ],
              },
            ],
          },
          expected: expect.objectContaining({
            id: 2,
            fields: [
              expect.objectContaining({ value: 'Front 2' }),
              expect.objectContaining({ value: 'Back 2' }),
            ],
          }),
        },
        {
          when: 'there are many reviewables each with 1 snapshot with a due date in the future',
          then: options.onlyDue
            ? 'returns `null`'
            : 'returns the reviewable with the oldest due date',
          fixture: {
            reviewables: [
              {
                id: 1,
                fields: [
                  { side: 0, position: 0, value: 'Front 1' },
                  { side: 1, position: 0, value: 'Back 1' },
                ],
                snapshots: [
                  {
                    due: add(new Date(), { days: 2 }),
                    createdAt: sub(new Date(), { days: 3 }),
                  },
                ],
              },
              {
                id: 2,
                fields: [
                  { side: 0, position: 0, value: 'Front 2' },
                  { side: 1, position: 0, value: 'Back 2' },
                ],
                snapshots: [
                  {
                    due: add(new Date(), { days: 1 }),
                    createdAt: sub(new Date(), { days: 2 }),
                  },
                ],
              },
            ],
          },
          expected: options.onlyDue
            ? null
            : expect.objectContaining({
                id: 2,
                fields: [
                  expect.objectContaining({ value: 'Front 2' }),
                  expect.objectContaining({ value: 'Back 2' }),
                ],
              }),
        },
        {
          when: 'there are many reviewables each with many snapshots with all due dates in the past',
          then: 'returns the reviewable where their latest snapshot has the oldest due date',
          fixture: {
            reviewables: [
              {
                id: 1,
                fields: [
                  { side: 0, position: 0, value: 'Front 1' },
                  { side: 1, position: 0, value: 'Back 1' },
                ],
                snapshots: [
                  {
                    due: sub(new Date(), { days: 1 }),
                    createdAt: sub(new Date(), { days: 2 }),
                  },
                  {
                    due: sub(new Date(), { days: 2 }),
                    createdAt: sub(new Date(), { days: 3 }),
                  },
                ],
              },
              {
                id: 2,
                fields: [
                  { side: 0, position: 0, value: 'Front 2' },
                  { side: 1, position: 0, value: 'Back 2' },
                ],
                snapshots: [
                  {
                    due: sub(new Date(), { days: 3 }),
                    createdAt: sub(new Date(), { days: 4 }),
                  },
                  {
                    due: sub(new Date(), { days: 4 }),
                    createdAt: sub(new Date(), { days: 5 }),
                  },
                ],
              },
            ],
          },
          expected: expect.objectContaining({
            id: 2,
            fields: [
              expect.objectContaining({ value: 'Front 2' }),
              expect.objectContaining({ value: 'Back 2' }),
            ],
          }),
        },
        {
          when: 'there are many reviewables each with many snapshots with all due dates in the future',
          then: options.onlyDue
            ? 'returns `null`'
            : 'returns the reviewable where their latest snapshot has the oldest due date',
          fixture: {
            reviewables: [
              {
                id: 1,
                fields: [
                  { side: 0, position: 0, value: 'Front 1' },
                  { side: 1, position: 0, value: 'Back 1' },
                ],
                snapshots: [
                  {
                    due: add(new Date(), { days: 4 }),
                    createdAt: sub(new Date(), { days: 5 }),
                  },
                  {
                    due: add(new Date(), { days: 3 }),
                    createdAt: sub(new Date(), { days: 4 }),
                  },
                ],
              },
              {
                id: 2,
                fields: [
                  { side: 0, position: 0, value: 'Front 2' },
                  { side: 1, position: 0, value: 'Back 2' },
                ],
                snapshots: [
                  {
                    due: add(new Date(), { days: 2 }),
                    createdAt: sub(new Date(), { days: 3 }),
                  },
                  {
                    due: add(new Date(), { days: 1 }),
                    createdAt: sub(new Date(), { days: 2 }),
                  },
                ],
              },
            ],
          },
          expected: options.onlyDue
            ? null
            : expect.objectContaining({
                id: 2,
                fields: [
                  expect.objectContaining({ value: 'Front 2' }),
                  expect.objectContaining({ value: 'Back 2' }),
                ],
              }),
        },
        {
          when: 'there are many reviewables each with many snapshots with some due dates in the past and some in the future',
          then: 'returns the reviewable where their latest snapshot has the oldest due date',
          fixture: {
            reviewables: [
              {
                id: 1,
                fields: [
                  { side: 0, position: 0, value: 'Front 1' },
                  { side: 1, position: 0, value: 'Back 1' },
                ],
                snapshots: [
                  {
                    due: add(new Date(), { days: 1 }),
                    createdAt: sub(new Date(), { days: 2 }),
                  },
                  {
                    due: add(new Date(), { days: 2 }),
                    createdAt: sub(new Date(), { days: 3 }),
                  },
                ],
              },
              {
                id: 2,
                fields: [
                  { side: 0, position: 0, value: 'Front 2' },
                  { side: 1, position: 0, value: 'Back 2' },
                ],
                snapshots: [
                  {
                    due: sub(new Date(), { days: 1 }),
                    createdAt: sub(new Date(), { days: 2 }),
                  },
                  {
                    due: sub(new Date(), { days: 2 }),
                    createdAt: sub(new Date(), { days: 3 }),
                  },
                ],
              },
            ],
          },
          expected: expect.objectContaining({
            id: 2,
            fields: [
              expect.objectContaining({ value: 'Front 2' }),
              expect.objectContaining({ value: 'Back 2' }),
            ],
          }),
        },
        {
          when: 'there are many reviewables each with many snapshots that have interleaved created and due dates',
          then: 'returns the reviewable where their latest snapshot has the oldest due date',
          fixture: {
            reviewables: [
              {
                id: 1,
                fields: [
                  { side: 0, position: 0, value: 'Front 1' },
                  { side: 1, position: 0, value: 'Back 1' },
                ],
                snapshots: [
                  {
                    due: sub(new Date(), { days: 1 }),
                    createdAt: sub(new Date(), { days: 2 }),
                  },
                  {
                    due: sub(new Date(), { days: 4 }),
                    createdAt: sub(new Date(), { days: 5 }),
                  },
                ],
              },
              {
                id: 2,
                fields: [
                  { side: 0, position: 0, value: 'Front 2' },
                  { side: 1, position: 0, value: 'Back 2' },
                ],
                snapshots: [
                  {
                    due: sub(new Date(), { days: 2 }),
                    createdAt: sub(new Date(), { days: 3 }),
                  },
                  {
                    due: sub(new Date(), { days: 3 }),
                    createdAt: sub(new Date(), { days: 4 }),
                  },
                ],
              },
            ],
          },
          expected: expect.objectContaining({
            id: 2,
            fields: [
              expect.objectContaining({ value: 'Front 2' }),
              expect.objectContaining({ value: 'Back 2' }),
            ],
          }),
        },
        {
          when: 'there are many reviewables with some having snapshots and some having no snapshots',
          then: 'returns the reviewable where their latest snapshot has the oldest due date',
          fixture: {
            reviewables: [
              {
                id: 1,
                fields: [
                  { side: 0, position: 0, value: 'Front 1' },
                  { side: 1, position: 0, value: 'Back 1' },
                ],
                snapshots: [],
              },
              {
                id: 2,
                fields: [
                  { side: 0, position: 0, value: 'Front 2' },
                  { side: 1, position: 0, value: 'Back 2' },
                ],
                snapshots: [
                  {
                    due: sub(new Date(), { days: 1 }),
                    createdAt: sub(new Date(), { days: 2 }),
                  },
                ],
              },
            ],
          },
          expected: expect.objectContaining({
            id: 2,
            fields: [
              expect.objectContaining({ value: 'Front 2' }),
              expect.objectContaining({ value: 'Back 2' }),
            ],
          }),
        },
      ])('and $when', ({ then, fixture, expected }) => {
        test(
          // eslint-disable-next-line jest/valid-title -- `then` is a string
          then,
          async () => {
            const { database, resetDatabaseMock } = await mockDatabase()
            const { default: getNextReview } = await import('./getNextReview')

            if (fixture) {
              const [{ id: noteId }] = await database
                .insert(note)
                .values({}) // The values are not significant to the test
                .returning()

              await Promise.all(
                fixture.reviewables.map(async ({ id, fields, snapshots }) => {
                  const [{ id: reviewableId }] = await database
                    .insert(reviewable)
                    .values({ id, note: noteId })
                    .returning()

                  await Promise.all(
                    fields.map(async (field) => {
                      const [{ id: noteFieldId }] = await database
                        .insert(noteField)
                        .values({
                          note: noteId,
                          hash: hashNoteFieldValue(field.value),
                          ...field,
                        })
                        .returning()

                      await database.insert(reviewableField).values({
                        reviewable: reviewableId,
                        field: noteFieldId,
                        side: field.side,
                      })
                    }),
                  )

                  await Promise.all(
                    snapshots.map(async ({ due, createdAt }) => {
                      const [{ id: reviewId }] = await database
                        .insert(review)
                        .values({
                          reviewable: reviewableId,

                          // The values below are not significant to the test
                          rating: 1,
                          duration: 1,
                          retention: 1,
                          dueFuzzed: false,
                          learningEnabled: false,
                          maxInterval: 100,
                          weights: Array.from({ length: 19 }, () => 1),
                        })
                        .returning()

                      await database.insert(reviewableSnapshot).values({
                        reviewable: reviewableId,
                        review: reviewId,
                        createdAt,
                        due,

                        // The values below are not significant to the test
                        difficulty: 1,
                        stability: 1,
                        state: 1,
                      })
                    }),
                  )
                }),
              )
            }

            const output = await getNextReview(options)

            expect(output).toEqual(expected)

            resetDatabaseMock()
          },
        )
      })
    },
  )

  describe('when the note field side and reviewable field side differ', () => {
    it('returns the fields with the reviewable side, ordered by the reviewable field side and note field position ascending', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const { default: getNextReview } = await import('./getNextReview')

      const fixture = {
        reviewable: {
          fields: [{ side: 1 }, { side: 1 }, { side: 0 }, { side: 0 }],
        },
        note: {
          fields: [
            { side: 0, position: 0, value: 'A' },
            { side: 0, position: 1, value: 'B' },
            { side: 1, position: 0, value: 'C' },
            { side: 1, position: 1, value: 'D' },
          ],
        },
      }

      const [{ id: noteId }] = await database
        .insert(note)
        .values({}) // The values are not significant to the test
        .returning()

      const [{ id: reviewableId }] = await database
        .insert(reviewable)
        .values({ note: noteId })
        .returning()

      const noteFields = await database
        .insert(noteField)
        .values(
          fixture.note.fields.map((field) => ({
            hash: hashNoteFieldValue(field.value),
            note: noteId,
            ...field,
          })),
        )
        .returning()

      await database.insert(reviewableField).values(
        fixture.reviewable.fields.map((field, index) => ({
          reviewable: reviewableId,
          field: noteFields[index].id,
          ...field,
        })),
      )

      const output = await getNextReview()

      expect(output).toEqual(
        expect.objectContaining({
          fields: [
            expect.objectContaining({
              side: 0,
              position: 0,
              value: 'C',
            }),
            expect.objectContaining({
              side: 0,
              position: 1,
              value: 'D',
            }),
            expect.objectContaining({
              side: 1,
              position: 0,
              value: 'A',
            }),
            expect.objectContaining({
              side: 1,
              position: 1,
              value: 'B',
            }),
          ],
        }),
      )

      resetDatabaseMock()
    })
  })
})
