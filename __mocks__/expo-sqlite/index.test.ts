import Database from 'better-sqlite3'
import {
  deleteDatabaseAsync,
  deleteDatabaseSync,
  deserializeDatabaseAsync,
  deserializeDatabaseSync,
  openDatabaseAsync,
  openDatabaseSync,
} from 'expo-sqlite'
import { serializedData } from './__fixtures__'

test('`deleteDatabaseAsync()` does not throw', () => {
  expect(
    async () => await deleteDatabaseAsync('database_name.db'),
  ).not.toThrow()
})

test('`deleteDatabaseSync()` does not throw', () => {
  expect(() => deleteDatabaseSync('database_name.db')).not.toThrow()
})

test('`deserializeDatabaseAsync()` returns an in-memory database with the deserialized data', async () => {
  const database = (await deserializeDatabaseAsync(
    serializedData,
    // Casting is necessary because the database mock, from Better SQLite 3, is
    // now returned which has a different structure from Expo SQLite.
  )) as unknown as ReturnType<typeof Database>

  expect(database).toBeInstanceOf(Database)
  expect(database).toHaveProperty('name', ':memory:')
  expect(database).toHaveProperty('open', true)
  expect(database).toHaveProperty('memory', true)
  expect(database.serialize().equals(serializedData)).toBeTrue()

  database.close()
})

test('`deserializeDatabaseSync()` returns an in-memory database with the deserialized data', () => {
  const database = deserializeDatabaseSync(
    serializedData,
    // Casting is necessary because the database mock, from Better SQLite 3, is
    // now returned which has a different structure from Expo SQLite.
  ) as unknown as ReturnType<typeof Database>

  expect(database).toBeInstanceOf(Database)
  expect(database).toHaveProperty('name', ':memory:')
  expect(database).toHaveProperty('open', true)
  expect(database).toHaveProperty('memory', true)
  expect(database.serialize().equals(serializedData)).toBeTrue()

  database.close()
})

test('`openDatabaseAsync()` returns an in-memory database', async () => {
  const database = (await openDatabaseAsync(
    'database_mock.db',
    // Casting is necessary because the database mock, from Better SQLite 3, is
    // now returned which has a different structure from Expo SQLite.
  )) as unknown as ReturnType<typeof Database>

  expect(database).toBeInstanceOf(Database)
  expect(database).toHaveProperty('name', ':memory:')
  expect(database).toHaveProperty('open', true)
  expect(database).toHaveProperty('memory', true)

  database.close()
})

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
