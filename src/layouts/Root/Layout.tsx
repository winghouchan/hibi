import { DataProvider, useDatabaseBrowser, useDatabaseMigrations } from '@/data'
import { IntlProvider } from '@/intl'
import { Stack } from 'expo-router'
import { useState } from 'react'
import { DevToolsBubble } from 'react-native-react-query-devtools'
import SplashScreen from './SplashScreen'

export default function RootLayout() {
  const [ready, setReady] = useState(false)

  useDatabaseBrowser()
  useDatabaseMigrations()

  return (
    <IntlProvider>
      <DataProvider>
        <Stack
          screenListeners={{
            transitionEnd: () => {
              setReady(true)
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
  )
}
