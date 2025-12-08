import { collection } from '@/collections/schema'
import { user } from '@/user/schema'
import { mockDatabase } from 'test/utils'

describe('setActiveCollection', () => {
  test(`sets the user's active collection`, async () => {
    const { database, resetDatabaseMock } = await mockDatabase()
    const { default: setActiveCollection } =
      await import('./setActiveCollection')

    const fixture = { collection: { name: 'Test Collection' } }

    const [{ id: activeCollection }] = await database
      .insert(collection)
      .values(fixture.collection)
      .returning()

    await database.insert(user).values({})

    await setActiveCollection(activeCollection)

    const [databaseState] = await database.select().from(user)

    expect(databaseState).toEqual(expect.objectContaining({ activeCollection }))

    resetDatabaseMock()
  })
})
