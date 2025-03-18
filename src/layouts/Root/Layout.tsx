import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { SplashScreen } from 'expo-router'
import { Suspense } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { DataProvider, useDatabaseBrowser, useDatabaseMigrations } from '@/data'
import { configureDevMenu } from '@/dev'
import { IntlProvider } from '@/intl'
import { log } from '@/telemetry'
import ErrorBoundary from './ErrorBoundary'
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
            <ErrorBoundary>
              <Suspense>{databaseReady && <Navigator />}</Suspense>
            </ErrorBoundary>
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </DataProvider>
    </IntlProvider>
  )
}
