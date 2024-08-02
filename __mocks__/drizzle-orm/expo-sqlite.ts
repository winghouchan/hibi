/**
 * The schema is used by Drizzle to build relational queries and provide type
 * annotations. The schema is imported directly from `@/database/schema` as
 * opposed to the index of `@/database` to prevent the set up of the actual
 * database which is imported into the index file (for re-exporting).
 *
 * @see {@link https://orm.drizzle.team/docs/rqb | Drizzle Documentation}
 */
import schema from '@/database/schema'
import { drizzle as drizzleBetterSqlite3 } from 'drizzle-orm/better-sqlite3'

/**
 * Mock of Drizzle's driver for Expo SQLite. As Expo's SQLite database has been
 * mocked with an SQLite database from Better SQLite 3, the correct driver needs
 * to also be used.
 *
 * @see {@link https://github.com/drizzle-team/drizzle-orm/tree/main/drizzle-orm/src/better-sqlite3 | Drizzle Better SQLite 3 Driver Source Code}
 * @see {@link https://github.com/drizzle-team/drizzle-orm/tree/main/drizzle-orm/src/expo-sqlite | Drizzle Expo SQLite Driver Source Code}
 */
export const drizzle = jest.fn<
  ReturnType<typeof drizzleBetterSqlite3<typeof schema>>,
  Parameters<typeof drizzleBetterSqlite3<typeof schema>>
>((database, config) => drizzleBetterSqlite3(database, { ...config, schema }))
