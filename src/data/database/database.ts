import { open } from '@op-engineering/op-sqlite'
import { drizzle } from 'drizzle-orm/op-sqlite'
import logger from './logger'
import schema from './schema'

/**
 * Name of the database file.
 *
 * ⚠️ Changing this will not rename the database file on the device. Should the
 * value of this change, the existing database file will need to be renamed; or
 * the data copied from the old database to the new database and the old database
 * deleted.
 */
const DATABASE_NAME = 'app.db'

/**
 * The underlying database, with APIs from OP SQLite.
 *
 * ⚠️ Changing the location of the database does not move the existing database
 * file. Should the location change, the existing database file will need to be
 * explicitly moved; or the data copied from the old database file to the new
 * database file and the old database file deleted.
 *
 * ⚠️ Ensure the end-to-end test database fixture server writes the database
 * fixture to the same location the application creates the the database file at.
 *
 * @see {@link https://ospfranco.notion.site/OP-SQLite-Documentation-a279a52102464d0cb13c3fa230d2f2dc | OP SQLite Documentation}
 */
export const nativeDatabase = open({
  name: DATABASE_NAME,
})

/**
 * The database, connected an object-relational mapping library (Drizzle).
 *
 * @see {@link https://orm.drizzle.team | Drizzle Documentation}
 */
const database = drizzle(nativeDatabase, {
  casing: 'snake_case',
  logger,
  schema,
})

export default database
