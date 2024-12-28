import { SplashScreen } from 'expo-router'
import { DevToolsBubble } from 'react-native-react-query-devtools'
import { DataProvider, useDatabaseBrowser, useDatabaseMigrations } from '@/data'
import { IntlProvider } from '@/intl'
import { log } from '@/telemetry'
import Navigator from './Navigator'

log.info('Opened app')

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const { success: databaseReady } = useDatabaseMigrations() // @todo: Handle migration error

  useDatabaseBrowser()

  return (
    <IntlProvider>
      <DataProvider>
        {databaseReady && <Navigator />}
        {process.env.NODE_ENV === 'development' && <DevToolsBubble />}
      </DataProvider>
    </IntlProvider>
  )
}
