import { jest } from '@jest/globals'
import * as drizzleOrmExpoSqliteMock from '__mocks__/drizzle-orm/expo-sqlite'
import * as expoSqliteMock from '__mocks__/expo-sqlite'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'

/**
 * Provides types for the database APIs when mocking the Expo SQLite database
 * with the Better SQLite 3 database in Node.js. They can be used to cast the
 * types of variables holding references to the database wrapped with Drizzle
 * ORM (`database`) or the underlying database (`nativeDatabase`). Casting may
 * be necessary because the interfaces between Expo SQLite and Better SQLite 3
 * are not exactly the same.
 */
export type DatabaseModuleMock = {
  /**
   * The type for the database mock connected to the object-relational mapping
   * library (Drizzle). There are slight differences in the types for Expo SQLite
   * and Better SQLite 3 so this type can be used for casting.
   *
   * Drizzle provides an abstraction over Expo SQLite's `runAsync` and `runSync`
   * functions and Better SQLite 3's `run` function with a function called `run`.
   * The `run` function from Drizzle will have different return types, depending
   * on the underlying database used.
   *
   * Expo SQLite's `run*` function(s) return the following type:
   * ```
   * {
   *   changes: number
   *   lastInsertRowId: number
   * }
   * ```
   *
   * While Better SQLite 3's `run` function returns the following type:
   * ```
   * {
   *   changes: number
   *   lastInsertRowId: number | bigint
   * }
   * ```
   *
   * @see {@link https://github.com/DefinitelyTyped/DefinitelyTyped/blob/aeddb679ec7112375941d277fcbc3ecac85e2f2d/types/better-sqlite3/index.d.ts#L103-L106 | Better SQLite 3 Type Definitions}
   * @see {@link https://docs.expo.dev/versions/latest/sdk/sqlite/#sqliterunresult | Expo Documentation}
   */
  database: ReturnType<typeof drizzleOrmExpoSqliteMock.drizzle>

  /**
   * The type for the underlying database when Expo SQLite is mocked with Better
   * SQLite 3 for running in Node.js.
   *
   * Expo SQLite and Better SQLite 3 have different properties and methods so this
   * type can be used for casting.
   *
   * @see {@link https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/better-sqlite3/index.d.ts | Better SQLite 3 Type Definitions}
   * @see {@link https://docs.expo.dev/versions/latest/sdk/sqlite | Expo Documentation}
   */
  nativeDatabase: ReturnType<typeof expoSqliteMock.openDatabaseSync>
}

/**
 * Mocks the database.
 *
 * See:
 * - README (in this directory) for more information.
 * - Tests for example usage.
 */
export default async function mockDatabase() {
  jest.resetModules()
  jest.unstable_mockModule(
    'drizzle-orm/expo-sqlite',
    () => drizzleOrmExpoSqliteMock,
  )
  jest.unstable_mockModule('expo-sqlite', () => expoSqliteMock)

  // Import `@/data` here because module registry has been reset and dependencies are now mocked
  const { database, nativeDatabase } = (await import(
    '@/data'
    // Casting is necessary because the database mock, from Better SQLite 3, is
    // now returned which has a different structure from Expo SQLite.
  )) as unknown as DatabaseModuleMock

  migrate(database, { migrationsFolder: 'src/data/database/migrations' })

  return {
    database,
    nativeDatabase,
    resetDatabaseMock: () => {
      nativeDatabase.close()
    },
  }
}
