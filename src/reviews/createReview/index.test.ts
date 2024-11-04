import { desc } from 'drizzle-orm'
import {
  createEmptyCard,
  fsrs,
  generatorParameters as schedulerParameters,
  Grade,
  Rating,
  ReviewLog,
} from 'ts-fsrs'
import { mockDatabase } from 'test/utils'
import { review, reviewableSnapshot } from '../schema'

describe('createReview', () => {
  describe('when there have been zero reviews', () => {
    test.each(
      ([Rating.Again, Rating.Hard, Rating.Good, Rating.Easy] as Grade[]).map(
        (rating) => ({
          input: {
            duration: 1000,
            rating,
          },
          expected: {
            review: schedulerParameters(),
            snapshot: fsrs().next(createEmptyCard(), new Date(), rating).card,
          },
        }),
      ),
    )(
      'and rating is $input.rating, the correct review and snapshot are generated',
      async ({ expected, input: { duration, rating } }) => {
        const { database, resetDatabaseMock } = await mockDatabase()
        const { createCollection } = await import('@/collections')
        const { createNote } = await import('@/notes')
        const { default: createReview } = await import('.')
        const collectionMock = await createCollection({
          name: 'Collection Mock',
        })
        const noteMock = await createNote({
          config: {
            reversible: false,
            separable: false,
          },
          collections: [collectionMock.id],
          fields: [[{ value: 'Field Mock 1' }], [{ value: 'Field Mock 2' }]],
        })
        const input = {
          reviewable: noteMock.reviewables[0].id,
          duration,
          rating,
        }

        const returnedState = await createReview(input)
        const queriedState = {
          review: await database.query.review.findFirst({
            orderBy: [desc(review.createdAt)],
          }),
          snapshot: await database.query.reviewableSnapshot.findFirst({
            orderBy: [desc(reviewableSnapshot.createdAt)],
          }),
        }

        const expectedReview = expect.objectContaining({
          id: 1,
          reviewable: noteMock.reviewables[0].id,
          rating: input.rating,
          duration: input.duration,
          dueFuzzed: expected.review.enable_fuzz,
          maxInterval: expected.review.maximum_interval,
          retention: expected.review.request_retention * 100,
          learningEnabled: expected.review.enable_short_term,
          weights: expected.review.w,
        })
        const expectedReviewCreatedAtBetween = [
          new Date(new Date().valueOf() - 1000),
          new Date(),
        ] as const
        const expectedSnapshot = expect.objectContaining({
          id: 1,
          reviewable: noteMock.reviewables[0].id,
          review: returnedState.review.id,
          state: expected.snapshot.state,
          stability: expected.snapshot.stability,
          difficulty: expected.snapshot.difficulty,
          createdAt: returnedState.review.createdAt,
        })
        const expectedSnapshotDueBetween = [
          new Date(expected.snapshot.due.valueOf() - 1000),
          new Date(expected.snapshot.due.valueOf() + 1000),
        ] as const

        expect(returnedState.review).toEqual(expectedReview)
        expect(queriedState.review).toEqual(expectedReview)

        // The `created_at` datetime is determined in the database and not something that can be mocked.
        // Expect it to be within 1000 ms of when the assertion is executed.
        expect(returnedState.review.createdAt).toBeBetween(
          ...expectedReviewCreatedAtBetween,
        )

        expect(returnedState.snapshot).toEqual(expectedSnapshot)
        expect(queriedState.snapshot).toEqual(expectedSnapshot)

        // Expect the reviewable snapshot state to have a due datetime within ±1000 ms of the expected due datetime.
        expect(returnedState.snapshot.due).toBeBetween(
          ...expectedSnapshotDueBetween,
        )

        resetDatabaseMock()
      },
    )
  })

  describe('when there has been one review', () => {
    test.each(
      ([Rating.Again, Rating.Hard, Rating.Good, Rating.Easy] as Grade[]).map(
        (rating) => {
          const parameters = schedulerParameters()
          const scheduler = fsrs(parameters)
          const now = new Date()
          const yesterday = new Date(new Date().setDate(now.getDate() - 1))

          const reviewEvents: { reviewedAt: Date; rating: Grade }[] = [
            { reviewedAt: yesterday, rating: Rating.Good },
            { reviewedAt: now, rating },
          ]
          const cards = [createEmptyCard(yesterday)]
          const logs: ReviewLog[] = []

          reviewEvents.forEach((reviewEvent, index) => {
            const { card, log } = scheduler.next(
              cards[index],
              reviewEvent.reviewedAt,
              reviewEvent.rating,
            )

            cards.push(card)
            logs.push(log)
          })

          return {
            input: {
              duration: 1000,
              rating,
            },
            data: {
              cards,
              logs,
              parameters,
            },
            expected: {
              review: parameters,
              snapshot: cards[cards.length - 1],
            },
          }
        },
      ),
    )(
      'and rating is $input.rating, the correct review and snapshot are generated',
      async ({ expected, data, input: { duration, rating } }) => {
        const { database, resetDatabaseMock } = await mockDatabase()
        const { createCollection } = await import('@/collections')
        const { createNote } = await import('@/notes')
        const { default: createReview } = await import('.')
        const collectionMock = await createCollection({
          name: 'Collection Mock',
        })
        const noteMock = await createNote({
          config: {
            reversible: false,
            separable: false,
          },
          collections: [collectionMock.id],
          fields: [[{ value: 'Field Mock 1' }], [{ value: 'Field Mock 2' }]],
        })
        await database.transaction(async (transaction) => {
          await transaction.insert(review).values(
            data.logs
              // Remove the last log as it contains the data assertions are made on
              .toSpliced(-1)
              .map((log) => ({
                reviewable: noteMock.reviewables[0].id,
                rating: log.rating,
                createdAt: log.review,
                duration,
                dueFuzzed: data.parameters.enable_fuzz,
                maxInterval: data.parameters.maximum_interval,
                retention: data.parameters.request_retention,
                learningEnabled: data.parameters.enable_short_term,
                weights: data.parameters.w,
              })),
          )
          await transaction.insert(reviewableSnapshot).values(
            data.cards
              // Remove the first card as it is the card's empty initial state
              .toSpliced(0, 1)
              // Remove the last card as it contains the data assertions are made on
              .toSpliced(-1)
              .map((card, index) => ({
                createdAt: data.logs[index].review,
                difficulty: card.difficulty,
                due: card.due,
                review: index + 1,
                reviewable: noteMock.reviewables[0].id,
                stability: card.stability,
                state: card.state,
              })),
          )
        })
        const input = {
          reviewable: noteMock.reviewables[0].id,
          duration,
          rating,
        }

        const returnedState = await createReview(input)
        const queriedState = {
          review: await database.query.review.findFirst({
            orderBy: [desc(review.createdAt)],
          }),
          snapshot: await database.query.reviewableSnapshot.findFirst({
            orderBy: [desc(reviewableSnapshot.createdAt)],
          }),
        }

        const expectedReview = expect.objectContaining({
          id: data.logs.length,
          reviewable: noteMock.reviewables[0].id,
          rating: input.rating,
          duration: input.duration,
          dueFuzzed: expected.review.enable_fuzz,
          maxInterval: expected.review.maximum_interval,
          retention: expected.review.request_retention * 100,
          learningEnabled: expected.review.enable_short_term,
          weights: expected.review.w,
        })
        const expectedReviewCreatedAtBetween = [
          new Date(new Date().valueOf() - 1000),
          new Date(),
        ] as const
        const expectedSnapshot = expect.objectContaining({
          id: data.logs.length,
          reviewable: noteMock.reviewables[0].id,
          review: returnedState.review.id,
          state: expected.snapshot.state,
          stability: expected.snapshot.stability,
          difficulty: expected.snapshot.difficulty,
          createdAt: returnedState.review.createdAt,
        })
        const expectedSnapshotDueBetween = [
          new Date(expected.snapshot.due.valueOf() - 1000),
          new Date(expected.snapshot.due.valueOf() + 1000),
        ] as const

        expect(returnedState.review).toEqual(expectedReview)
        expect(queriedState.review).toEqual(expectedReview)

        // The `created_at` datetime is determined in the database and not something that can be mocked.
        // Expect it to be within 1000 ms of when the assertion is executed.
        expect(returnedState.review.createdAt).toBeBetween(
          ...expectedReviewCreatedAtBetween,
        )
        expect(queriedState.review?.createdAt).toBeBetween(
          ...expectedReviewCreatedAtBetween,
        )

        expect(returnedState.snapshot).toEqual(expectedSnapshot)
        expect(queriedState.snapshot).toEqual(expectedSnapshot)

        // Expect the reviewable snapshot state to have a due datetime within ±1000 ms of the expected due datetime.
        expect(returnedState.snapshot.due).toBeBetween(
          ...expectedSnapshotDueBetween,
        )
        expect(queriedState.snapshot?.due).toBeBetween(
          ...expectedSnapshotDueBetween,
        )

        resetDatabaseMock()
      },
    )
  })

  describe('when there have been many reviews', () => {
    test.each(
      ([Rating.Again, Rating.Hard, Rating.Good, Rating.Easy] as Grade[]).map(
        (rating) => {
          const parameters = schedulerParameters()
          const scheduler = fsrs(parameters)
          const now = new Date()
          const yesterday = new Date(new Date().setDate(now.getDate() - 1))
          const twoDaysAgo = new Date(new Date().setDate(now.getDate() - 2))

          const reviewEvents: { reviewedAt: Date; rating: Grade }[] = [
            { reviewedAt: twoDaysAgo, rating: Rating.Good },
            { reviewedAt: yesterday, rating: Rating.Good },
            { reviewedAt: now, rating },
          ]
          const cards = [createEmptyCard(twoDaysAgo)]
          const logs: ReviewLog[] = []

          reviewEvents.forEach((reviewEvent, index) => {
            const { card, log } = scheduler.next(
              cards[index],
              reviewEvent.reviewedAt,
              reviewEvent.rating,
            )

            cards.push(card)
            logs.push(log)
          })

          return {
            input: {
              duration: 1000,
              rating,
            },
            data: {
              cards,
              logs,
              parameters,
            },
            expected: {
              review: parameters,
              snapshot: cards[cards.length - 1],
            },
          }
        },
      ),
    )(
      'and rating is $input.rating, the correct review and snapshot are generated',
      async ({ expected, data, input: { duration, rating } }) => {
        const { database, resetDatabaseMock } = await mockDatabase()
        const { createCollection } = await import('@/collections')
        const { createNote } = await import('@/notes')
        const { default: createReview } = await import('.')
        const collectionMock = await createCollection({
          name: 'Collection Mock',
        })
        const noteMock = await createNote({
          config: {
            reversible: false,
            separable: false,
          },
          collections: [collectionMock.id],
          fields: [[{ value: 'Field Mock 1' }], [{ value: 'Field Mock 2' }]],
        })
        await database.transaction(async (transaction) => {
          await transaction.insert(review).values(
            data.logs
              // Remove the last log as it contains the data assertions are made on
              .toSpliced(-1)
              .map((log) => ({
                reviewable: noteMock.reviewables[0].id,
                rating: log.rating,
                createdAt: log.review,
                duration,
                dueFuzzed: data.parameters.enable_fuzz,
                maxInterval: data.parameters.maximum_interval,
                retention: data.parameters.request_retention,
                learningEnabled: data.parameters.enable_short_term,
                weights: data.parameters.w,
              })),
          )
          await transaction.insert(reviewableSnapshot).values(
            data.cards
              // Remove the first card as it is the card's empty initial state
              .toSpliced(0, 1)
              // Remove the last card as it contains the data assertions are made on
              .toSpliced(-1)
              .map((card, index) => ({
                createdAt: data.logs[index].review,
                difficulty: card.difficulty,
                due: card.due,
                review: index + 1,
                reviewable: noteMock.reviewables[0].id,
                stability: card.stability,
                state: card.state,
              })),
          )
        })
        const input = {
          reviewable: noteMock.reviewables[0].id,
          duration,
          rating,
        }

        const returnedState = await createReview(input)
        const queriedState = {
          review: await database.query.review.findFirst({
            orderBy: [desc(review.createdAt)],
          }),
          snapshot: await database.query.reviewableSnapshot.findFirst({
            orderBy: [desc(reviewableSnapshot.createdAt)],
          }),
        }

        const expectedReview = expect.objectContaining({
          id: data.logs.length,
          reviewable: noteMock.reviewables[0].id,
          rating: input.rating,
          duration: input.duration,
          dueFuzzed: expected.review.enable_fuzz,
          maxInterval: expected.review.maximum_interval,
          retention: expected.review.request_retention * 100,
          learningEnabled: expected.review.enable_short_term,
          weights: expected.review.w,
        })
        const expectedReviewCreatedAtBetween = [
          new Date(new Date().valueOf() - 1000),
          new Date(),
        ] as const
        const expectedSnapshot = expect.objectContaining({
          id: data.logs.length,
          reviewable: noteMock.reviewables[0].id,
          review: returnedState.review.id,
          state: expected.snapshot.state,
          stability: expected.snapshot.stability,
          difficulty: expected.snapshot.difficulty,
          createdAt: returnedState.review.createdAt,
        })
        const expectedSnapshotDueBetween = [
          new Date(expected.snapshot.due.valueOf() - 1000),
          new Date(expected.snapshot.due.valueOf() + 1000),
        ] as const

        expect(returnedState.review).toEqual(expectedReview)
        expect(queriedState.review).toEqual(expectedReview)

        // The `created_at` datetime is determined in the database and not something that can be mocked.
        // Expect it to be within 1000 ms of when the assertion is executed.
        expect(returnedState.review.createdAt).toBeBetween(
          ...expectedReviewCreatedAtBetween,
        )
        expect(queriedState.review?.createdAt).toBeBetween(
          ...expectedReviewCreatedAtBetween,
        )

        expect(returnedState.snapshot).toEqual(expectedSnapshot)
        expect(queriedState.snapshot).toEqual(expectedSnapshot)

        // Expect the reviewable snapshot state to have a due datetime within ±1000 ms of the expected due datetime.
        expect(returnedState.snapshot.due).toBeBetween(
          ...expectedSnapshotDueBetween,
        )
        expect(queriedState.snapshot?.due).toBeBetween(
          ...expectedSnapshotDueBetween,
        )

        resetDatabaseMock()
      },
    )
  })
})
