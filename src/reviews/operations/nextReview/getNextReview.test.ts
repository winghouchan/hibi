import { add, sub } from 'date-fns'
import { note } from '@/notes/schema'
import { review, reviewable, reviewableSnapshot } from '@/reviews/schema'
import { mockDatabase } from 'test/utils'

describe('getNextReview', () => {
  describe.each([
    {
      when: 'when there are no reviewables',
      then: 'returns `null`',
      expected: null,
    },
    {
      when: 'when there is 1 reviewable with no snapshots',
      then: 'returns the reviewable',
      fixture: {
        reviewables: [
          {
            id: 1,
            snapshots: [],
          },
        ],
      },
      expected: expect.objectContaining({ id: 1 }),
    },
    {
      when: 'when there is 1 reviewable with 1 snapshot with a due date in the past',
      then: 'returns the reviewable',
      fixture: {
        reviewables: [
          {
            id: 1,
            snapshots: [
              {
                due: sub(new Date(), { days: 1 }),
                createdAt: sub(new Date(), { days: 2 }),
              },
            ],
          },
        ],
      },
      expected: expect.objectContaining({ id: 1 }),
    },
    {
      when: 'when there is 1 reviewable with 1 snapshot with a due date in the future',
      then: 'returns the reviewable',
      fixture: {
        reviewables: [
          {
            id: 1,
            snapshots: [
              {
                due: add(new Date(), { days: 1 }),
                createdAt: sub(new Date(), { days: 2 }),
              },
            ],
          },
        ],
      },
      expected: expect.objectContaining({ id: 1 }),
    },
    {
      when: 'when there is 1 reviewable with many snapshots with all due dates in the past',
      then: 'returns the reviewable',
      fixture: {
        reviewables: [
          {
            id: 1,
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
      expected: expect.objectContaining({ id: 1 }),
    },
    {
      when: 'when there is 1 reviewable with many snapshots with all due dates in the future',
      then: 'returns the reviewable',
      fixture: {
        reviewables: [
          {
            id: 1,
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
      expected: expect.objectContaining({ id: 1 }),
    },
    {
      when: 'when there are many reviewables each with 1 snapshot with a due date in the past',
      then: 'returns the reviewable with the oldest due date',
      fixture: {
        reviewables: [
          {
            id: 1,
            snapshots: [
              {
                due: sub(new Date(), { days: 1 }),
                createdAt: sub(new Date(), { days: 2 }),
              },
            ],
          },
          {
            id: 2,
            snapshots: [
              {
                due: sub(new Date(), { days: 2 }),
                createdAt: sub(new Date(), { days: 3 }),
              },
            ],
          },
        ],
      },
      expected: expect.objectContaining({ id: 2 }),
    },
    {
      when: 'when there are many reviewables each with 1 snapshot with some due dates being in the past and some in the future',
      then: 'returns the reviewable with the oldest due date',
      fixture: {
        reviewables: [
          {
            id: 1,
            snapshots: [
              {
                due: add(new Date(), { days: 1 }),
                createdAt: sub(new Date(), { days: 2 }),
              },
            ],
          },
          {
            id: 2,
            snapshots: [
              {
                due: sub(new Date(), { days: 1 }),
                createdAt: sub(new Date(), { days: 2 }),
              },
            ],
          },
        ],
      },
      expected: expect.objectContaining({ id: 2 }),
    },
    {
      when: 'when there are many reviewables each with 1 snapshot with a due date in the future',
      then: 'returns the reviewable with the oldest due date',
      fixture: {
        reviewables: [
          {
            id: 1,
            snapshots: [
              {
                due: add(new Date(), { days: 2 }),
                createdAt: sub(new Date(), { days: 3 }),
              },
            ],
          },
          {
            id: 2,
            snapshots: [
              {
                due: add(new Date(), { days: 1 }),
                createdAt: sub(new Date(), { days: 2 }),
              },
            ],
          },
        ],
      },
      expected: expect.objectContaining({ id: 2 }),
    },
    {
      when: 'when there are many reviewables each with many snapshots with all due dates in the past',
      then: 'returns the reviewable where their latest snapshot has the oldest due date',
      fixture: {
        reviewables: [
          {
            id: 1,
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
      expected: expect.objectContaining({ id: 2 }),
    },
    {
      when: 'when there are many reviewables each with many snapshots with all due dates in the future',
      then: 'returns the reviewable where their latest snapshot has the oldest due date',
      fixture: {
        reviewables: [
          {
            id: 1,
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
      expected: expect.objectContaining({ id: 2 }),
    },
    {
      when: 'when there are many reviewables each with many snapshots with some due dates in the past and some in the future',
      then: 'returns the reviewable where their latest snapshot has the oldest due date',
      fixture: {
        reviewables: [
          {
            id: 1,
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
      expected: expect.objectContaining({ id: 2 }),
    },
    {
      when: 'when there are many reviewables each with many snapshots that have interleaved created and due dates',
      then: 'returns the reviewable where their latest snapshot has the oldest due date',
      fixture: {
        reviewables: [
          {
            id: 1,
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
      expected: expect.objectContaining({ id: 2 }),
    },
    {
      when: 'when there are many reviewables with some having snapshots and some having no snapshots',
      then: 'returns the reviewable reviewable where their latest snapshot has the oldest due date',
      fixture: {
        reviewables: [
          {
            id: 1,
            snapshots: [],
          },
          {
            id: 2,
            snapshots: [
              {
                due: sub(new Date(), { days: 1 }),
                createdAt: sub(new Date(), { days: 2 }),
              },
            ],
          },
        ],
      },
      expected: expect.objectContaining({ id: 2 }),
    },
  ])('$when', ({ then, fixture, expected }) => {
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
            fixture.reviewables.map(async ({ id, snapshots }) => {
              const [{ id: reviewableId }] = await database
                .insert(reviewable)
                .values({ id, note: noteId })
                .returning()

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

        const output = await getNextReview()

        expect(output).toEqual(expected)

        resetDatabaseMock()
      },
    )
  })
})
