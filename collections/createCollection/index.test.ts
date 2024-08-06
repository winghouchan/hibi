import { mockDatabase } from '@/test/utils'
import { Collection } from '.'

describe('createCollection', () => {
  it('inserts a new collection into the database', async () => {
    const { database, resetDatabaseMock } = await mockDatabase()
    const { default: createCollection } = await import('.')
    const input = { name: 'Collection' }

    await createCollection(input)
    const output = await database.query.collection.findMany()

    expect(output).toHaveLength(1)
    expect(output[0]).toHaveProperty('id', 1)
    expect(output[0]).toHaveProperty('name', input.name)
    // The `created_at` datetime is determined in the database and not something that can be mocked.
    // Expect it to be within 1000 ms of when the assertion is executed.
    expect(output[0].created_at).toBeBetween(
      new Date(new Date().valueOf() - 1000),
      new Date(),
    )

    resetDatabaseMock()
  })

  it('returns the created collection', async () => {
    const { resetDatabaseMock } = await mockDatabase()
    const { default: createCollection } = await import('.')
    const input = { name: 'Collection' }

    const output = await createCollection(input)

    expect(output).toHaveProperty('id', 1)
    expect(output).toHaveProperty('name', input.name)
    // The `created_at` datetime is determined in the database and not something that can be mocked.
    // Expect it to be within 1000 ms of when the assertion is executed.
    expect(output.created_at).toBeBetween(
      new Date(new Date().valueOf() - 1000),
      new Date(),
    )

    resetDatabaseMock()
  })

  it('auto-increments the collection ID', async () => {
    const { database, resetDatabaseMock } = await mockDatabase()
    const { default: createCollection } = await import('.')
    const input = { name: 'Collection' }

    await createCollection(input)
    await createCollection(input)
    const output = await database.query.collection.findMany()

    expect(output).toHaveLength(2)
    expect(output[0]).toHaveProperty('id', 1)
    expect(output[1]).toHaveProperty('id', 2)

    resetDatabaseMock()
  })

  it('when no collection name is provided, does not create a collection', async () => {
    const { resetDatabaseMock } = await mockDatabase()
    const { default: createCollection } = await import('.')
    const input = {} as Collection // Cast empty object to `Collection` so that compile time checks pass and run time checks can be tested

    await expect(async () => await createCollection(input)).rejects.toThrow(
      'NOT NULL constraint failed: collection.name',
    )

    resetDatabaseMock()
  })

  it('when the collection name is an empty string, does not create a collection', async () => {
    const { resetDatabaseMock } = await mockDatabase()
    const { default: createCollection } = await import('.')
    const input = {
      name: '',
    }

    await expect(async () => await createCollection(input)).rejects.toThrow(
      'CHECK constraint failed: name',
    )

    resetDatabaseMock()
  })
})
