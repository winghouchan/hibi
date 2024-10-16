import { DataProvider, useDatabaseBrowser, useDatabaseMigrations } from '@/data'
import { IntlProvider } from '@/intl'
import { Stack } from 'expo-router'
import { DevToolsBubble } from 'react-native-react-query-devtools'
import useSplashScreen from './useSplashScreen'

export default function RootLayout() {
  const SplashScreen = useSplashScreen()

  useDatabaseBrowser()
  useDatabaseMigrations()

  return (
    <IntlProvider>
      <DataProvider>
        <Stack
          screenListeners={{
            transitionEnd: async () => {
              if (SplashScreen.visible) {
                await SplashScreen.hide()
              }
            },
          }}
          screenOptions={{
            headerShown: false,
          }}
        />
        {process.env.NODE_ENV === 'development' && <DevToolsBubble />}
      </DataProvider>
    </IntlProvider>
  )
}
