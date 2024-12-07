import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator'
import { useLayoutEffect } from 'react'
import { log } from '@/telemetry'
import { database, migrations } from './database'

/**
 * Apply migrations to the database.
 *
 * @see {@link https://orm.drizzle.team/docs/get-started-sqlite#add-migrations-to-your-app | Drizzle Documentation}
 */
export default function useDatabaseMigrations() {
  const { error, success } = useMigrations(database, migrations)

  useLayoutEffect(() => {
    if (error === undefined && success === false) {
      log.info('Applying database migrations')
    } else if (success) {
      log.info('Applied database migrations')
    } else if (error) {
      log.error('Applying database migrations failed:', error)
    }
  }, [error, success])

  return { error, success }
}
