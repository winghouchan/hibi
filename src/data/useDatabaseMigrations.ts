import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator'
import { database, migrations } from './database'

/**
 * Apply migrations to the database.
 *
 * @see {@link https://orm.drizzle.team/docs/get-started-sqlite#add-migrations-to-your-app | Drizzle Documentation}
 */
export default function useDatabaseMigrations() {
  return useMigrations(database, migrations)
}
