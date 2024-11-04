/**
 * The schema is used by Drizzle to build relational queries and provide type
 * annotations. The schema is imported directly from `@/data/database/schema`
 * as opposed to the index of `@/data` to prevent the set up of the actual
 * database which is imported into the index file (for re-exporting).
 *
 * @see {@link https://orm.drizzle.team/docs/rqb | Drizzle Documentation}
 */
import { jest } from '@jest/globals'
import { Database } from 'better-sqlite3'
import { DrizzleConfig } from 'drizzle-orm'
import { drizzle as drizzleBetterSqlite3 } from 'drizzle-orm/better-sqlite3'
import schema from '@/data/database/schema'

/**
 * Mock of Drizzle's driver for Expo SQLite. As Expo's SQLite database has been
 * mocked with an SQLite database from Better SQLite 3, the correct driver needs
 * to also be used.
 *
 * @see {@link https://github.com/drizzle-team/drizzle-orm/tree/main/drizzle-orm/src/better-sqlite3 | Drizzle Better SQLite 3 Driver Source Code}
 * @see {@link https://github.com/drizzle-team/drizzle-orm/tree/main/drizzle-orm/src/expo-sqlite | Drizzle Expo SQLite Driver Source Code}
 */
export const drizzle = jest.fn((database: Database, config: DrizzleConfig) =>
  drizzleBetterSqlite3(database, { ...config, schema }),
)
