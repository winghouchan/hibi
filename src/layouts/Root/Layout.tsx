import { SplashScreen } from 'expo-router'
import { LaunchArguments } from 'react-native-launch-arguments'
import { DevToolsBubble } from 'react-native-react-query-devtools'
import {
  DataProvider,
  useDatabaseBrowser,
  useDatabaseFixture,
  useDatabaseMigrations,
} from '@/data'
import { IntlProvider } from '@/intl'
import { log } from '@/telemetry'
import Navigator from './Navigator'

const launchArguments = LaunchArguments.value()

log.info('Opened app', { launchArguments })

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const { success: databaseReady } = useDatabaseMigrations() // @todo: Handle migration error
  const loadedDatabaseFixture = useDatabaseFixture({ databaseReady }) // @todo: Handle load database fixture error

  useDatabaseBrowser()

  return (
    <IntlProvider>
      <DataProvider>
        {databaseReady && loadedDatabaseFixture && <Navigator />}
        {process.env.NODE_ENV === 'development' && <DevToolsBubble />}
      </DataProvider>
    </IntlProvider>
  )
}
