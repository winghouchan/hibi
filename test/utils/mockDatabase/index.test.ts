import { SqliteError } from 'better-sqlite3'
import mockDatabase from '.'

/**
 * The actual application schema should not be used for these tests so its
 * implementation and the function that does the migration have been mocked out.
 */
jest.mock('@/database/schema', () => ({}))
jest.mock('drizzle-orm/better-sqlite3/migrator', () => ({
  migrate: jest.fn(),
}))

test('`mockDatabase()` opens an in-memory database', () => {
  const { nativeDatabase, resetDatabaseMock } = mockDatabase()
  // `Database` needs to be imported here because Jest's module registry was reset in `mockDatabase`
  const Database = require('better-sqlite3')

  expect(nativeDatabase).toBeInstanceOf(Database)
  expect(nativeDatabase.name).toBe(':memory:')
  expect(nativeDatabase.open).toBeTrue()
  expect(nativeDatabase.memory).toBeTrue()

  resetDatabaseMock()
})

test('`resetDatabaseMock()` closes the mocked database', () => {
  const { nativeDatabase, resetDatabaseMock } = mockDatabase()

  resetDatabaseMock()

  expect(nativeDatabase.open).toBeFalse()
  expect(() =>
    nativeDatabase
      .prepare(`CREATE TABLE mock_table (mock_column INTEGER PRIMARY KEY)`)
      .run(),
  ).toThrow(new TypeError('The database connection is not open'))
})

test('`mockDatabase()` after `resetDatabaseMock()` creates an isolated database', () => {
  let { nativeDatabase, resetDatabaseMock } = mockDatabase()

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
  ;({ nativeDatabase, resetDatabaseMock } = mockDatabase())

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
