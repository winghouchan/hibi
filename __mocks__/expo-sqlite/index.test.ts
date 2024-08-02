import Database from 'better-sqlite3'
import { openDatabaseSync } from 'expo-sqlite'

test('`openDatabaseSync()` returns an in-memory database', () => {
  const database = openDatabaseSync(
    'database_mock.db',
    // Casting is necessary because the database mock, from Better SQLite 3, is
    // now returned which has a different structure from Expo SQLite.
  ) as unknown as ReturnType<typeof Database>

  expect(database).toBeInstanceOf(Database)
  expect(database).toHaveProperty('name', ':memory:')
  expect(database).toHaveProperty('open', true)
  expect(database).toHaveProperty('memory', true)

  database.close()
})
