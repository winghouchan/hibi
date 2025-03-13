import { collection } from '@/collections/schema'
import { mockDatabase } from 'test/utils'

describe('getOnboardingCollection', () => {
  test.each([
    {
      name: 'when there are no collections, returns `null`',
      fixture: {},
      expected: null,
    },
    {
      name: 'when there is 1 collection, returns the collection',
      fixture: {
        collection: {
          name: 'Collection Name',
        },
      },
      expected: expect.objectContaining({
        id: expect.any(Number),
        name: 'Collection Name',
      }),
    },
  ])('$name', async ({ fixture, expected }) => {
    const { database, resetDatabaseMock } = await mockDatabase()
    const { default: getOnboardingCollection } = await import(
      './getOnboardingCollection'
    )

    if (fixture.collection) {
      await database.insert(collection).values(fixture.collection)
    }

    const result = await getOnboardingCollection()

    expect(result).toEqual(expected)

    resetDatabaseMock()
  })
})
