import { Stack } from 'expo-router'

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="notes/new" options={{ presentation: 'modal' }} />
      <Stack.Screen
        name="notes/edit/[id]"
        options={{ presentation: 'modal' }}
      />
    </Stack>
  )
}
