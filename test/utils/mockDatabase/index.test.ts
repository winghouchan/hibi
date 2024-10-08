import { jest } from '@jest/globals'
import Database, { SqliteError } from 'better-sqlite3'
import type MockDatabaseFn from '.'

/**
 * The actual application schema should not be used for these tests so its
 * implementation and the function that does the migration have been mocked out.
 */
jest.doMock('@/data/database/schema', () => ({ default: {} }))
jest.doMock('drizzle-orm/better-sqlite3/migrator', () => ({
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
  expect(nativeDatabase).toBeInstanceOf(Database)
  expect(nativeDatabase.name).toBe(':memory:')
  expect(nativeDatabase.open).toBeTrue()
  expect(nativeDatabase.memory).toBeTrue()
})

test('`resetDatabaseMock()` closes the mocked database', async () => {
  resetDatabaseMock()

  expect(nativeDatabase.open).toBeFalse()
  expect(() =>
    nativeDatabase
      .prepare(`CREATE TABLE mock_table (mock_column INTEGER PRIMARY KEY)`)
      .run(),
  ).toThrow(new TypeError('The database connection is not open'))
})

test('`mockDatabase()` after `resetDatabaseMock()` creates an isolated database', async () => {
  function createTableMock() {
    return nativeDatabase
      .prepare(`CREATE TABLE mock_table (mock_column INTEGER PRIMARY KEY)`)
      .run()
  }

  function insertIntoTableMock() {
    return nativeDatabase
      .prepare(`INSERT INTO mock_table (mock_column) VALUES (1)`)
      .run()
  }

  createTableMock()
  insertIntoTableMock()

  expect(nativeDatabase.prepare(`SELECT * FROM mock_table`).all()).toEqual([
    { mock_column: 1 },
  ])

  resetDatabaseMock()

  // prettier-ignore - Stop removing preceding empty line
  ;({ nativeDatabase, resetDatabaseMock } = await mockDatabase())

  expect(createTableMock).not.toThrow(
    new SqliteError('table mock_table already exists', 'SQLITE_ERROR'),
  )
  expect(insertIntoTableMock).not.toThrow(
    new SqliteError(
      'UNIQUE constraint failed: mock_table.mock_column',
      'SQLITE_ERROR',
    ),
  )
  expect(nativeDatabase.prepare(`SELECT * FROM mock_table`).all()).toEqual([
    { mock_column: 1 },
  ])

  resetDatabaseMock()
})
