import { useEffect } from 'react'
import { loadDatabaseFixture } from 'e2e/utils'

interface Config {
  databaseReady: boolean
}

export default function useDatabaseFixture({ databaseReady }: Config) {
  useEffect(() => {
    if (databaseReady && process.env.EXPO_PUBLIC_E2E) {
      loadDatabaseFixture()
    }
  }, [databaseReady])
}
