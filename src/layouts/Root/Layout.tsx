import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { SplashScreen } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
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
        <GestureHandlerRootView>
          <BottomSheetModalProvider>
            {databaseReady && <Navigator />}
            {process.env.NODE_ENV === 'development' && <DevToolsBubble />}
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </DataProvider>
    </IntlProvider>
  )
}
