import { useDrizzleStudio } from 'expo-drizzle-studio-plugin'
import { nativeDatabase } from './database'

/**
 * Connects the database to Drizzle Studio to allow reading and writing data in a graphical interface.
 *
 * @see {@link https://github.com/drizzle-team/drizzle-studio-expo | Drizzle Documentation}
 */
/* istanbul ignore next: function is a wrapper for dependency */
export default function useDatabaseBrowser() {
  useDrizzleStudio({ driver: 'opsqlite', db: nativeDatabase })
}
