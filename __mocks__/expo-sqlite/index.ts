import Database from 'better-sqlite3'

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
