import { jest } from '@jest/globals'
import Database from 'better-sqlite3'

/**
 * Mock of Expo SQLite's function to asynchronously delete a database file. As the
 * database mock is in-memory and not saved to a file on disk, there is no action
 * to take.
 *
 * @see {@link https://docs.expo.dev/versions/latest/sdk/sqlite/#sqlitedeletedatabaseasyncdatabasename | Expo SQLite `deleteDatabaseAsync` Documentation}
 */
export const deleteDatabaseAsync = jest.fn(async () => {})

/**
 * Mock of Expo SQLite's function to synchronously delete a database file. As the
 * database mock is in-memory and not saved to a file on disk, there is no action
 * to take.
 *
 * @see {@link https://docs.expo.dev/versions/latest/sdk/sqlite/#sqlitedeletedatabasesyncdatabasename | Expo SQLite `deleteDatabaseSync` Documentation}
 */
export const deleteDatabaseSync = jest.fn()

/**
 * Mock of Expo SQLite's function to asynchronously create an in-memory database
 * with serialized data. Expo SQLite cannot be run in a Node.js environment as
 * it runs native device code. The mock constructs an in-memory database using
 * Better SQLite 3, which can be run in a Node.js environment.
 *
 * @see {@link https://github.com/WiseLibs/better-sqlite3 | Better SQLite 3 Documentation}
 * @see {@link https://github.com/expo/expo/tree/main/packages/expo-sqlite | Expo SQLite Source Code}
 * @see {@link https://docs.expo.dev/versions/latest/sdk/sqlite/#sqlitedeserializedatabaseasyncserializeddata-options | Expo SQLite `deserializeDatabaseAsync` Documentation}
 */
export const deserializeDatabaseAsync = jest.fn(
  async (serializedData: Buffer) => new Database(serializedData),
)

/**
 * Mock of Expo SQLite's function to synchronously create an in-memory database
 * with serialized data. Expo SQLite cannot be run in a Node.js environment as
 * it runs native device code. The mock constructs an in-memory database using
 * Better SQLite 3, which can be run in a Node.js environment.
 *
 * @see {@link https://github.com/WiseLibs/better-sqlite3 | Better SQLite 3 Documentation}
 * @see {@link https://github.com/expo/expo/tree/main/packages/expo-sqlite | Expo SQLite Source Code}
 * @see {@link https://docs.expo.dev/versions/latest/sdk/sqlite/#sqlitedeserializedatabasesyncserializeddata-options | Expo SQLite `deserializeDatabaseSync` Documentation}
 */
export const deserializeDatabaseSync = jest.fn(
  (serializedData: Buffer) => new Database(serializedData),
)

/**
 * Mock of Expo SQLite's function to asynchronously open/create a database. Expo
 * SQLite cannot be run in a Node.js environment as it runs native device code.
 * The mock constructs an in-memory database using Better SQLite 3, which can be
 * run in a Node.js environment.
 *
 * @see {@link https://github.com/WiseLibs/better-sqlite3 | Better SQLite 3 Documentation}
 * @see {@link https://github.com/expo/expo/tree/main/packages/expo-sqlite | Expo SQLite Source Code}
 * @see {@link https://docs.expo.dev/versions/latest/sdk/sqlite/#sqliteopendatabaseasyncdatabasename-options Expo SQLite `openDatabaseAsync` Documentation}
 */
export const openDatabaseAsync = jest.fn(async () => new Database(':memory:'))

/**
 * Mock of Expo SQLite's function to synchronously open/create a database. Expo
 * SQLite cannot be run in a Node.js environment as it runs native device code.
 * The mock constructs an in-memory database using Better SQLite 3, which can be
 * run in a Node.js environment.
 *
 * @see {@link https://github.com/WiseLibs/better-sqlite3 | Better SQLite 3 Documentation}
 * @see {@link https://github.com/expo/expo/tree/main/packages/expo-sqlite | Expo SQLite Source Code}
 * @see {@link https://docs.expo.dev/versions/latest/sdk/sqlite/#sqliteopendatabasesyncdatabasename-options | Expo SQLite `openDatabaseSync` Documentation}
 */
export const openDatabaseSync = jest.fn(() => new Database(':memory:'))
