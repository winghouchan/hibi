import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { SplashScreen } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { DataProvider, useDatabaseBrowser, useDatabaseMigrations } from '@/data'
import { configureDevMenu } from '@/dev'
import { IntlProvider } from '@/intl'
import { log } from '@/telemetry'
import Navigator from './Navigator'

log.info('Opened app')

SplashScreen.preventAutoHideAsync()

configureDevMenu()

export default function RootLayout() {
  const { success: databaseReady } = useDatabaseMigrations() // @todo: Handle migration error

  useDatabaseBrowser()

  return (
    <IntlProvider>
      <DataProvider>
        <GestureHandlerRootView>
          <BottomSheetModalProvider>
            {databaseReady && <Navigator />}
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </DataProvider>
    </IntlProvider>
  )
}
