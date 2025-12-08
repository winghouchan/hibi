import { collection } from '@/collections/schema'
import { user } from '@/user/schema'
import { mockDatabase } from 'test/utils'

describe('getActiveCollection', () => {
  test('when an active collection has been set, returns the active collection', async () => {
    const { database, resetDatabaseMock } = await mockDatabase()
    const { default: getActiveCollection } =
      await import('./getActiveCollection')

    const fixture = { collection: { name: 'Test Collection' } }

    const [{ id: activeCollection }] = await database
      .insert(collection)
      .values(fixture.collection)
      .returning()

    await database.insert(user).values({ activeCollection })

    const output = await getActiveCollection()

    expect(output).toEqual(expect.objectContaining(fixture.collection))

    resetDatabaseMock()
  })

  test('when no active collection has been set, returns the first collection', async () => {
    const { database, resetDatabaseMock } = await mockDatabase()
    const { default: getActiveCollection } =
      await import('./getActiveCollection')

    const fixture = {
      collections: [
        { name: 'Test Collection 1' },
        { name: 'Test Collection 2' },
      ],
    }

    await database.insert(collection).values(fixture.collections).returning()

    const output = await getActiveCollection()

    expect(output).toEqual(expect.objectContaining(fixture.collections[0]))

    resetDatabaseMock()
  })
})
