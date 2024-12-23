import { jest } from '@jest/globals'
import { Client } from '@libsql/client'
import { DrizzleConfig } from 'drizzle-orm'
import { drizzle as drizzleLibSql } from 'drizzle-orm/libsql'
/**
 * The schema is used by Drizzle to build relational queries and provide type
 * annotations. The schema is imported directly from `@/data/database/schema`
 * as opposed to the index of `@/data` to prevent the set up of the actual
 * database which is imported into the index file (for re-exporting).
 *
 * @see {@link https://orm.drizzle.team/docs/rqb | Drizzle Documentation}
 */
import schema from '@/data/database/schema'

/**
 * Mock of Drizzle's driver for OP SQLite. As OP's SQLite database has been
 * mocked with an SQLite database from libSQL, the correct driver needs to
 * also be used.
 *
 * @see {@link https://github.com/drizzle-team/drizzle-orm/tree/main/drizzle-orm/src/libsql | Drizzle libSQL Driver Source Code}
 * @see {@link https://github.com/drizzle-team/drizzle-orm/tree/main/drizzle-orm/src/op-sqlite | Drizzle OP SQLite Driver Source Code}
 */
export const drizzle = jest.fn((database: Client, config: DrizzleConfig) =>
  drizzleLibSql(database, { ...config, schema }),
)
