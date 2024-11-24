import { Stack } from 'expo-router'
import { StrictMode, useState } from 'react'
import { DevToolsBubble } from 'react-native-react-query-devtools'
import {
  DataProvider,
  useDatabaseBrowser,
  useDatabaseFixture,
  useDatabaseMigrations,
} from '@/data'
import { IntlProvider } from '@/intl'
import SplashScreen from './SplashScreen'

export default function RootLayout() {
  const [navigatorReady, setNavigatorReady] = useState(false)
  const { success: databaseReady } = useDatabaseMigrations() // @todo: Handle migration error
  const ready = navigatorReady && databaseReady

  useDatabaseBrowser()
  useDatabaseFixture({ databaseReady })

  return (
    <StrictMode>
      <IntlProvider>
        <DataProvider>
          <Stack
            screenListeners={{
              transitionEnd: () => {
                setNavigatorReady(true)
              },
            }}
            screenOptions={{
              headerShown: false,
            }}
          />
          <SplashScreen ready={ready} />
          {process.env.NODE_ENV === 'development' && <DevToolsBubble />}
        </DataProvider>
      </IntlProvider>
    </StrictMode>
  )
}
