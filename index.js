import { registerRootComponent } from 'expo'
import Constants from 'expo-constants'
import { ExpoRoot } from 'expo-router'
import { StrictMode } from 'react'
import configureStyleSheet from '@/ui/configureStyleSheet'

/**
 * Style sheet must be configured before components are imported
 *
 * @see {@link https://www.unistyl.es/v3/guides/expo-router}
 */
configureStyleSheet()

// Must be exported or Fast Refresh won't update the context
export function App() {
  if (Constants.expoConfig.extra.isStorybookEnabled) {
    const { default: Storybook } = require('./.storybook')

    return <Storybook />
  } else {
    const ctx = require.context('./src/app')

    return (
      <StrictMode>
        <ExpoRoot context={ctx} />
      </StrictMode>
    )
  }
}

registerRootComponent(App)
