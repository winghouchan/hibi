import { drizzle } from 'drizzle-orm/expo-sqlite'
import { openDatabaseSync } from 'expo-sqlite'
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
 * The underlying database, with APIs from Expo SQLite.
 *
 * @see {@link https://docs.expo.dev/versions/latest/sdk/sqlite/ | Expo Documentation}
 */
export const nativeDatabase = openDatabaseSync(DATABASE_NAME)

/**
 * The database, connected an object-relational mapping library (Drizzle).
 *
 * @see {@link https://orm.drizzle.team | Drizzle Documentation}
 */
const database = drizzle(nativeDatabase, {
  casing: 'snake_case',
  schema,
})

export default database
