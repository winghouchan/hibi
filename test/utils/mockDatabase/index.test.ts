import { jest } from '@jest/globals'
import type MockDatabaseFn from '.'

/**
 * The actual application schema should not be used for these tests so its
 * implementation and the function that does the migration have been mocked out.
 */
jest.doMock('@/data/database/schema', () => ({ default: {} }))
jest.doMock('drizzle-orm/libsql/migrator', () => ({
  migrate: jest.fn(),
}))

let mockDatabase: typeof MockDatabaseFn,
  nativeDatabase: Awaited<ReturnType<typeof MockDatabaseFn>>['nativeDatabase'],
  resetDatabaseMock: Awaited<
    ReturnType<typeof MockDatabaseFn>
  >['resetDatabaseMock']

beforeEach(async () => {
  ;({ default: mockDatabase } = await import('.'))
  ;({ nativeDatabase, resetDatabaseMock } = await mockDatabase())
})

afterEach(() => {
  resetDatabaseMock()
})

test('`mockDatabase()` opens an in-memory database', async () => {
  expect(nativeDatabase).toHaveProperty('closed', false)
  expect(nativeDatabase).toHaveProperty('protocol', 'file')
})

test('`resetDatabaseMock()` closes the mocked database', async () => {
  resetDatabaseMock()

  expect(nativeDatabase.closed).toBeTrue()

  await expect(
    nativeDatabase.execute(
      `CREATE TABLE mock_table (mock_column INTEGER PRIMARY KEY)`,
    ),
  ).rejects.toThrow(new TypeError('CLIENT_CLOSED: The client is closed'))
})

test('`mockDatabase()` after `resetDatabaseMock()` creates an isolated database', async () => {
  async function createTableMock() {
    return await nativeDatabase.execute(
      `CREATE TABLE mock_table (mock_column INTEGER PRIMARY KEY)`,
    )
  }

  async function insertIntoTableMock() {
    return await nativeDatabase.execute(
      `INSERT INTO mock_table (mock_column) VALUES (1)`,
    )
  }

  await createTableMock()
  await insertIntoTableMock()

  expect(
    (await nativeDatabase.execute(`SELECT * FROM mock_table`)).rows,
  ).toEqual([{ mock_column: 1 }])

  resetDatabaseMock()

  // prettier-ignore - Stop removing preceding empty line
  ;({ nativeDatabase, resetDatabaseMock } = await mockDatabase())

  await createTableMock()
  await insertIntoTableMock()

  expect(
    (await nativeDatabase.execute(`SELECT * FROM mock_table`)).rows,
  ).toEqual([{ mock_column: 1 }])

  resetDatabaseMock()
})
