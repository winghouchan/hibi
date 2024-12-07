import { useEffect, useState } from 'react'
import { log } from '@/telemetry'
import { loadDatabaseFixture } from 'e2e/utils'

interface Config {
  databaseReady: boolean
}

export default function useDatabaseFixture({ databaseReady }: Config) {
  const [loadedDatabaseFixture, setLoadedDatabaseFixture] = useState(
    !process.env.EXPO_PUBLIC_E2E,
  )

  useEffect(() => {
    if (databaseReady && process.env.EXPO_PUBLIC_E2E) {
      loadDatabaseFixture()
        .then(() => setLoadedDatabaseFixture(true))
        .catch((error) => log.error(error))
    }
  }, [databaseReady])

  return loadedDatabaseFixture
}
