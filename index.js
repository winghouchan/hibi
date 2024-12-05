import { registerRootComponent } from 'expo'
import { ExpoRoot } from 'expo-router'
import { StrictMode } from 'react'

// Must be exported or Fast Refresh won't update the context
export function App() {
  const ctx = require.context('./src/app')
  return (
    <StrictMode>
      <ExpoRoot context={ctx} />
    </StrictMode>
  )
}

registerRootComponent(App)
