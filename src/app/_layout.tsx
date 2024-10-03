import { DataProvider, useDatabaseBrowser, useDatabaseMigrations } from '@/data'
import { Stack } from 'expo-router'
import { DevToolsBubble } from 'react-native-react-query-devtools'

export default function Layout() {
  useDatabaseBrowser()
  useDatabaseMigrations()

  return (
    <DataProvider>
      <Stack />
      {process.env.NODE_ENV === 'development' && <DevToolsBubble />}
    </DataProvider>
  )
}
