import { useDatabaseBrowser, useDatabaseMigrations } from '@/database'
import { Stack } from 'expo-router'

export default function Layout() {
  useDatabaseBrowser()
  useDatabaseMigrations()

  return (
    <Stack>
      <Stack.Screen name="index" />
    </Stack>
  )
}
