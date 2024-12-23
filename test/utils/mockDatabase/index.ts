import { jest } from '@jest/globals'
import { migrate } from 'drizzle-orm/libsql/migrator'
import * as opSqliteMock from '__mocks__/@op-engineering/op-sqlite'
import * as drizzleOrmOpSqliteMock from '__mocks__/drizzle-orm/op-sqlite'

/**
 * Provides types for the database APIs when mocking the OP SQLite database with
 * the libSQL database in Node.js. It can be used to cast the types of variables
 * holding references to the database wrapped with Drizzle ORM (`database`) or
 * the underlying database (`nativeDatabase`). Casting may be necessary because
 * the interfaces between OP SQLite and libSQL are not exactly the same.
 */
export type DatabaseModuleMock = {
  /**
   * The type for the database mock connected to the object-relational mapping
   * library (Drizzle). There are slight differences in the types for OP SQLite
   * and libSQL so this type can be used for casting.
   *
   * One example is Drizzle providing an abstraction over OP SQLite's and libSQL's
   * `execute` functions with a function called `run`. The `run` function from
   * Drizzle will have different return types, depending on the underlying
   * database used.
   *
   * OP SQLite's `execute` function returns the following type:
   * ```
   * Promise<{
   *   columnNames?: string[]
   *   insertId?: number
   *   metadata?: ColumnMetadata[]
   *   rawRows?: Scalar[][]
   *   res?: any[]
   *   rows: Record<string, Scalar>[]
   *   rowsAffected: number
   * }>
   * ```
   *
   * While libSQL's `execute` function returns the following type:
   * ```
   * Promise<{
   *   columns: string[]
   *   columnTypes: string[]
   *   lastInsertRowid: bigint | undefined
   *   rows: Row[]
   *   rowsAffected: number
   * }>
   * ```
   *
   * @see {@link https://github.com/tursodatabase/libsql-client-ts/ | libSQL's Source}
   * @see {@link https://github.com/OP-Engineering/op-sqlite | OP SQLite's Source}
   */
  database: ReturnType<typeof drizzleOrmOpSqliteMock.drizzle>

  /**
   * The type for the underlying database when OP SQLite is mocked with libSQL
   * for running in Node.js.
   *
   * OP SQLite and libSQL have different properties and methods so this type can
   * be used for casting.
   *
   * @see {@link https://github.com/tursodatabase/libsql-client-ts/ | libSQL's Source}
   * @see {@link https://github.com/OP-Engineering/op-sqlite | OP SQLite's Source}
   */
  nativeDatabase: ReturnType<typeof opSqliteMock.open>
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
  jest.doMock('drizzle-orm/op-sqlite', () => ({
    __esModule: true,
    ...drizzleOrmOpSqliteMock,
  }))
  jest.doMock('@op-engineering/op-sqlite', () => ({
    __esModule: true,
    ...opSqliteMock,
  }))

  // Import `@/data` here because module registry has been reset and dependencies are now mocked
  const { database, nativeDatabase } = (await import(
    '@/data'
    // Casting is necessary because the database mock, from libSQL, is now
    // returned which has a different structure from OP SQLite.
  )) as unknown as DatabaseModuleMock

  await migrate(database, { migrationsFolder: 'src/data/database/migrations' })

  return {
    database,
    nativeDatabase,
    resetDatabaseMock: () => {
      nativeDatabase.close()
    },
  }
}
